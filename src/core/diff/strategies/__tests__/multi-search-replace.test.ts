import { MultiSearchReplaceDiffStrategy } from "../multi-search-replace"

describe("MultiSearchReplaceDiffStrategy", () => {
	describe("validateMarkerSequencing", () => {
		let strategy: MultiSearchReplaceDiffStrategy

		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy()
		})

		it("validates correct marker sequence", () => {
			const diff = "<<<<<<< SEARCH\n" + "some content\n" + "=======\n" + "new content\n" + ">>>>>>> REPLACE"
			expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
		})

		it("validates multiple correct marker sequences", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content1\n" +
				"=======\n" +
				"new1\n" +
				">>>>>>> REPLACE\n\n" +
				"<<<<<<< SEARCH\n" +
				"content2\n" +
				"=======\n" +
				"new2\n" +
				">>>>>>> REPLACE"
			expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
		})

		it("validates multiple correct marker sequences with line numbers", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				":start_line:10\n" +
				"-------\n" +
				"content1\n" +
				"=======\n" +
				"new1\n" +
				">>>>>>> REPLACE\n\n" +
				"<<<<<<< SEARCH\n" +
				":start_line:10\n" +
				"-------\n" +
				"content2\n" +
				"=======\n" +
				"new2\n" +
				">>>>>>> REPLACE"
			expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
		})

		it("detects separator before search", () => {
			const diff = "=======\n" + "content\n" + ">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("'=======' found in your diff content")
			expect(result.error).toContain("Diff block is malformed")
		})

		it("detects missing separator", () => {
			const diff = "<<<<<<< SEARCH\n" + "content\n" + ">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("'>>>>>>> REPLACE' found in your diff content")
			expect(result.error).toContain("Diff block is malformed")
		})

		it("detects two separators", () => {
			const diff = "<<<<<<< SEARCH\n" + "content\n" + "=======\n" + "=======\n" + ">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("'=======' found in your diff content")
			expect(result.error).toContain("When removing merge conflict markers")
		})

		it("detects replace before separator (merge conflict message)", () => {
			const diff = "<<<<<<< SEARCH\n" + "content\n" + ">>>>>>>"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("'>>>>>>>' found in your diff content")
			expect(result.error).toContain("When removing merge conflict markers")
		})

		it("detects incomplete sequence", () => {
			const diff = "<<<<<<< SEARCH\n" + "content\n" + "=======\n" + "new content"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Expected '>>>>>>> REPLACE' was not found")
		})

		describe("exact matching", () => {
			let strategy: MultiSearchReplaceDiffStrategy

			beforeEach(() => {
				strategy = new MultiSearchReplaceDiffStrategy(1.0, 5) // Default 1.0 threshold for exact matching, 5 line buffer for tests
			})

			it("should replace matching content", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts
<<<<<<< SEARCH
function hello() {
    console.log("hello")
}
=======
function hello() {
    console.log("hello world")
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe('function hello() {\n    console.log("hello world")\n}\n')
				}
			})

			it("should replace matching content in multiple blocks", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts
<<<<<<< SEARCH
function hello() {
=======
function helloWorld() {
>>>>>>> REPLACE
<<<<<<< SEARCH
    console.log("hello")
=======
    console.log("hello world")
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe('function helloWorld() {\n    console.log("hello world")\n}\n')
				}
			})

			it("should replace matching content in multiple blocks with line numbers", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:1
-------
function hello() {
=======
function helloWorld() {
>>>>>>> REPLACE
<<<<<<< SEARCH
:start_line:2
-------
    console.log("hello")
=======
    console.log("hello world")
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe('function helloWorld() {\n    console.log("hello world")\n}\n')
				}
			})

			it("should replace matching content when end_line is passed in", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:1
:end_line:1
-------
function hello() {
=======
function helloWorld() {
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe('function helloWorld() {\n    console.log("hello")\n}\n')
				}
			})

			it("should match content with different surrounding whitespace", async () => {
				const originalContent = "\nfunction example() {\n    return 42;\n}\n\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
function example() {
    return 42;
}
=======
function example() {
    return 43;
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("\nfunction example() {\n    return 43;\n}\n\n")
				}
			})

			it("should match content with different indentation in search block", async () => {
				const originalContent = "    function test() {\n        return true;\n    }\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
function test() {
    return true;
}
=======
function test() {
    return false;
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("    function test() {\n        return false;\n    }\n")
				}
			})

			it("should handle tab-based indentation", async () => {
				const originalContent = "function test() {\n\treturn true;\n}\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
function test() {
\treturn true;
}
=======
function test() {
\treturn false;
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("function test() {\n\treturn false;\n}\n")
				}
			})

			it("should preserve mixed tabs and spaces", async () => {
				const originalContent = "\tclass Example {\n\t    constructor() {\n\t\tthis.value = 0;\n\t    }\n\t}"
				const diffContent = `test.ts
<<<<<<< SEARCH
\tclass Example {
\t    constructor() {
\t\tthis.value = 0;
\t    }
\t}
=======
\tclass Example {
\t    constructor() {
\t\tthis.value = 1;
\t    }
\t}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(
						"\tclass Example {\n\t    constructor() {\n\t\tthis.value = 1;\n\t    }\n\t}",
					)
				}
			})

			it("should handle additional indentation with tabs", async () => {
				const originalContent = "\tfunction test() {\n\t\treturn true;\n\t}"
				const diffContent = `test.ts
<<<<<<< SEARCH
function test() {
\treturn true;
}
=======
function test() {
\t// Add comment
\treturn false;
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("\tfunction test() {\n\t\t// Add comment\n\t\treturn false;\n\t}")
				}
			})

			it("should preserve exact indentation characters when adding lines", async () => {
				const originalContent = "\tfunction test() {\n\t\treturn true;\n\t}"
				const diffContent = `test.ts
<<<<<<< SEARCH
\tfunction test() {
\t\treturn true;
\t}
=======
\tfunction test() {
\t\t// First comment
\t\t// Second comment
\t\treturn true;
\t}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(
						"\tfunction test() {\n\t\t// First comment\n\t\t// Second comment\n\t\treturn true;\n\t}",
					)
				}
			})

			it("should handle Windows-style CRLF line endings", async () => {
				const originalContent = "function test() {\r\n    return true;\r\n}\r\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
function test() {
    return true;
}
=======
function test() {
    return false;
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("function test() {\r\n    return false;\r\n}\r\n")
				}
			})

			it("should return false if search content does not match", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts
<<<<<<< SEARCH
function hello() {
    console.log("wrong")
}
=======
function hello() {
    console.log("hello world")
}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(false)
			})

			it("should return false if diff format is invalid", async () => {
				const originalContent = 'function hello() {\n    console.log("hello")\n}\n'
				const diffContent = `test.ts\nInvalid diff format`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(false)
			})

			it("should handle multiple lines with proper indentation", async () => {
				const originalContent =
					"class Example {\n    constructor() {\n        this.value = 0\n    }\n\n    getValue() {\n        return this.value\n    }\n}\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
    getValue() {
        return this.value
    }
=======
    getValue() {
        // Add logging
        console.log("Getting value")
        return this.value
    }
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(
						'class Example {\n    constructor() {\n        this.value = 0\n    }\n\n    getValue() {\n        // Add logging\n        console.log("Getting value")\n        return this.value\n    }\n}\n',
					)
				}
			})

			it("should preserve whitespace exactly in the output", async () => {
				const originalContent = "    indented\n        more indented\n    back\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
    indented
        more indented
    back
=======
    modified
        still indented
    end
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("    modified\n        still indented\n    end\n")
				}
			})

			it("should preserve indentation when adding new lines after existing content", async () => {
				const originalContent = "				onScroll={() => updateHighlights()}"
				const diffContent = `test.ts
<<<<<<< SEARCH
				onScroll={() => updateHighlights()}
=======
				onScroll={() => updateHighlights()}
				onDragOver={(e) => {
					e.preventDefault()
					e.stopPropagation()
				}}
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(
						"				onScroll={() => updateHighlights()}\n				onDragOver={(e) => {\n					e.preventDefault()\n					e.stopPropagation()\n				}}",
					)
				}
			})

			it("should handle varying indentation levels correctly", async () => {
				const originalContent = `
class Example {
    constructor() {
        this.value = 0;
        if (true) {
            this.init();
        }
    }
}`.trim()

				const diffContent = `test.ts
<<<<<<< SEARCH
    class Example {
        constructor() {
            this.value = 0;
            if (true) {
                this.init();
            }
        }
    }
=======
    class Example {
        constructor() {
            this.value = 1;
            if (true) {
                this.init();
                this.setup();
                this.validate();
            }
        }
    }
>>>>>>> REPLACE`.trim()

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(
						`
class Example {
    constructor() {
        this.value = 1;
        if (true) {
            this.init();
            this.setup();
            this.validate();
        }
    }
}`.trim(),
					)
				}
			})

			it("should handle mixed indentation styles in the same file", async () => {
				const originalContent = `class Example {
    constructor() {
        this.value = 0;
        if (true) {
            this.init();
        }
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
    constructor() {
        this.value = 0;
        if (true) {
        this.init();
        }
    }
=======
    constructor() {
        this.value = 1;
        if (true) {
        this.init();
        this.validate();
        }
    }
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Example {
    constructor() {
        this.value = 1;
        if (true) {
        this.init();
        this.validate();
        }
    }
}`)
				}
			})

			it("should handle Python-style significant whitespace", async () => {
				const originalContent = `def example():
    if condition:
        do_something()
        for item in items:
            process(item)
    return True`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
    if condition:
        do_something()
        for item in items:
            process(item)
=======
    if condition:
        do_something()
        while items:
            item = items.pop()
            process(item)
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`def example():
    if condition:
        do_something()
        while items:
            item = items.pop()
            process(item)
    return True`)
				}
			})

			it("should preserve empty lines with indentation", async () => {
				const originalContent = `function test() {
    const x = 1;
    
    if (x) {
        return true;
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
    const x = 1;
    
    if (x) {
=======
    const x = 1;
    
    // Check x
    if (x) {
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`function test() {
    const x = 1;
    
    // Check x
    if (x) {
        return true;
    }
}`)
				}
			})

			it("should handle indentation when replacing entire blocks", async () => {
				const originalContent = `class Test {
    method() {
        if (true) {
            console.log("test");
        }
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
    method() {
        if (true) {
            console.log("test");
        }
    }
=======
    method() {
        try {
            if (true) {
                console.log("test");
            }
        } catch (e) {
            console.error(e);
        }
    }
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Test {
    method() {
        try {
            if (true) {
                console.log("test");
            }
        } catch (e) {
            console.error(e);
        }
    }
}`)
				}
			})

			it("should handle negative indentation relative to search content", async () => {
				const originalContent = `class Example {
    constructor() {
        if (true) {
            this.init();
            this.setup();
        }
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
            this.init();
            this.setup();
=======
        this.init();
        this.setup();
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Example {
    constructor() {
        if (true) {
        this.init();
        this.setup();
        }
    }
}`)
				}
			})

			it("should handle extreme negative indentation (no indent)", async () => {
				const originalContent = `class Example {
    constructor() {
        if (true) {
            this.init();
        }
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
            this.init();
=======
this.init();
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Example {
    constructor() {
        if (true) {
this.init();
        }
    }
}`)
				}
			})

			it("should handle mixed indentation changes in replace block", async () => {
				const originalContent = `class Example {
    constructor() {
        if (true) {
            this.init();
            this.setup();
            this.validate();
        }
    }
}`.trim()
				const diffContent = `test.ts
<<<<<<< SEARCH
            this.init();
            this.setup();
            this.validate();
=======
        this.init();
            this.setup();
    this.validate();
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Example {
    constructor() {
        if (true) {
        this.init();
            this.setup();
    this.validate();
        }
    }
}`)
				}
			})

			it("should find matches from middle out", async () => {
				const originalContent = `
function one() {
    return "target";
}

function two() {
    return "target";
}

function three() {
    return "target";
}

function four() {
    return "target";
}

function five() {
    return "target";
}`.trim()

				const diffContent = `test.ts
<<<<<<< SEARCH
    return "target";
=======
    return "updated";
>>>>>>> REPLACE`

				// Search around the middle (function three)
				// Even though all functions contain the target text,
				// it should match the one closest to line 9 first
				const result = await strategy.applyDiff(originalContent, diffContent, 9)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`function one() {
    return "target";
}

function two() {
    return "target";
}

function three() {
    return "updated";
}

function four() {
    return "target";
}

function five() {
    return "target";
}`)
				}
			})
		})

		describe("line number stripping", () => {
			describe("line number stripping", () => {
				let strategy: MultiSearchReplaceDiffStrategy

				beforeEach(() => {
					strategy = new MultiSearchReplaceDiffStrategy()
				})

				it("should strip line numbers from both search and replace sections", async () => {
					const originalContent = "function test() {\n    return true;\n}\n"
					const diffContent = `test.ts
<<<<<<< SEARCH
1 | function test() {
2 |     return true;
3 | }
=======
1 | function test() {
2 |     return false;
3 | }
>>>>>>> REPLACE`

					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("function test() {\n    return false;\n}\n")
					}
				})

				it("should strip line numbers with leading spaces", async () => {
					const originalContent = "function test() {\n    return true;\n}\n"
					const diffContent = `test.ts
<<<<<<< SEARCH
 1 | function test() {
 2 |     return true;
 3 | }
=======
 1 | function test() {
 2 |     return false;
 3 | }
>>>>>>> REPLACE`

					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("function test() {\n    return false;\n}\n")
					}
				})

				it("should preserve content that naturally starts with pipe", async () => {
					const originalContent = "|header|another|\n|---|---|\n|data|more|\n"
					const diffContent = `test.ts
<<<<<<< SEARCH
1 | |header|another|
2 | |---|---|
3 | |data|more|
=======
1 | |header|another|
2 | |---|---|
3 | |data|updated|
>>>>>>> REPLACE`

					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("|header|another|\n|---|---|\n|data|updated|\n")
					}
				})

				describe("aggressive line number stripping fallback", () => {
					// Tests for aggressive line number stripping fallback
					it("should use aggressive line number stripping when line numbers are inconsistent", async () => {
						const originalContent = "function test() {\n    return true;\n}\n"

						const diffContent = [
							"<<<<<<< SEARCH",
							":start_line:1",
							"-------",
							"1 | function test() {",
							"    return true;", // missing line number
							"3 | }",
							"=======",
							"function test() {",
							"    return fallback;",
							"}",
							">>>>>>> REPLACE",
						].join("\n")

						const result = await strategy.applyDiff(originalContent, diffContent)
						expect(result.success).toBe(true)
						if (result.success) {
							expect(result.content).toBe("function test() {\n    return fallback;\n}\n")
						}
					})

					it("should handle pipe characters without numbers using aggressive fallback", async () => {
						const originalContent = "function test() {\n    return true;\n}\n"

						const diffContent = [
							"<<<<<<< SEARCH",
							":start_line:1",
							"-------",
							"| function test() {",
							"|     return true;",
							"| }",
							"=======",
							"function test() {",
							"    return piped;",
							"}",
							">>>>>>> REPLACE",
						].join("\n")

						const result = await strategy.applyDiff(originalContent, diffContent)
						expect(result.success).toBe(true)
						if (result.success) {
							expect(result.content).toBe("function test() {\n    return piped;\n}\n")
						}
					})
				})

				it("should preserve indentation when stripping line numbers", async () => {
					const originalContent = "    function test() {\n        return true;\n    }\n"
					const diffContent = `test.ts
<<<<<<< SEARCH
1 |     function test() {
2 |         return true;
3 |     }
=======
1 |     function test() {
2 |         return false;
3 |     }
>>>>>>> REPLACE`

					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("    function test() {\n        return false;\n    }\n")
					}
				})

				it("should handle different line numbers between sections", async () => {
					const originalContent = "function test() {\n    return true;\n}\n"
					const diffContent = `test.ts
<<<<<<< SEARCH
10 | function test() {
11 |     return true;
12 | }
=======
20 | function test() {
21 |     return false;
22 | }
>>>>>>> REPLACE`

					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("function test() {\n    return false;\n}\n")
					}
				})

				it("detects search marker when expecting replace", () => {
					const diff = "<<<<<<< SEARCH\n" + "content\n" + "=======\n" + "new content\n" + "<<<<<<< SEARCH"
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(false)
					expect(result.error).toContain("'<<<<<<< SEARCH' found in your diff content")
				})

				it("allows escaped search marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(true)
				})

				it("allows escaped separator in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(true)
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"test.ts\n" +
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"test.ts\n" +
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("allows escaped search marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped separator in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped search marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped search marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped separator in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped replace marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped separator in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped replace marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("allows escaped replace marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					expect(strategy["validateMarkerSequencing"](diff).success).toBe(true)
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"replaced content\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("replaced content\n")
					}
				})

				it("processes escaped replace marker in content", async () => {
					const originalContent = "before\n>>>>>>> REPLACE\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes multiple escaped markers in content", async () => {
					const originalContent = "<<<<<<< SEARCH\n=======\n>>>>>>> REPLACE\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"\\<<<<<<< SEARCH\n" +
						"\\=======\n" +
						"\\>>>>>>> REPLACE\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped search marker in content", async () => {
					const originalContent = "before\n<<<<<<< SEARCH\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< SEARCH\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped replace marker in content", async () => {
					const originalContent = "before\n>>>>>>> REPLACE\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped separator in content", async () => {
					const originalContent = "before\n=======\nafter\n"
					const diffContent =
						"test.ts\n" +
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\=======\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped replace marker in content", async () => {
					const originalContent = "before\n>>>>>>> REPLACE\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes multiple escaped markers in content", async () => {
					const originalContent = "<<<<<<< SEARCH\n=======\n>>>>>>> REPLACE\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"\\<<<<<<< SEARCH\n" +
						"\\=======\n" +
						"\\>>>>>>> REPLACE\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes escaped replace marker in content", async () => {
					const originalContent = "before\n>>>>>>> REPLACE\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("processes multiple escaped markers in content", async () => {
					const originalContent = "<<<<<<< SEARCH\n=======\n>>>>>>> REPLACE\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"\\<<<<<<< SEARCH\n" +
						"\\=======\n" +
						"\\>>>>>>> REPLACE\n" +
						"=======\n" +
						"unchanged\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("unchanged\n")
					}
				})

				it("allows escaped replace marker in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\>>>>>>> REPLACE\n" +
						"after\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(true)
				})

				it("allows multiple escaped markers in content", () => {
					const diff =
						"<<<<<<< SEARCH\n" +
						"\\<<<<<<< SEARCH\n" +
						"\\=======\n" +
						"\\>>>>>>> REPLACE\n" +
						"=======\n" +
						"new content\n" +
						">>>>>>> REPLACE"
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(true)
				})

				it("handles escaping of markers with custom suffixes", async () => {
					const originalContent = "before\n<<<<<<< HEAD\nmiddle\n>>>>>>> feature-branch\nafter\n"
					const diffContent =
						"<<<<<<< SEARCH\n" +
						"before\n" +
						"\\<<<<<<< HEAD\n" +
						"middle\n" +
						"\\>>>>>>> feature-branch\n" +
						"after\n" +
						"=======\n" +
						"replaced content\n" +
						">>>>>>> REPLACE"
					const result = await strategy.applyDiff(originalContent, diffContent)
					expect(result.success).toBe(true)
					if (result.success) {
						expect(result.content).toBe("replaced content\n")
					}
				})

				it("detects separator when expecting replace", () => {
					const diff = "<<<<<<< SEARCH\n" + "content\n" + "=======\n" + "new content\n" + "======="
					const result = strategy["validateMarkerSequencing"](diff)
					expect(result.success).toBe(false)
					expect(result.error).toContain("'=======' found in your diff content")
				})

				describe("command line processing", () => {
					let strategy: MultiSearchReplaceDiffStrategy
					beforeEach(() => {
						strategy = new MultiSearchReplaceDiffStrategy()
					})

					it("should process diff from command line arguments", async () => {
						// This test is designed to be run from the command line with file arguments
						// Example: npx jest src/core/diff/strategies/__tests__/multi-search-replace.test.ts -t "should process diff" -- file.ts diff.diff

						// Get command line arguments
						const args = process.argv.slice(2)

						// Skip test if not run with arguments
						// Parse command line arguments for --source and --diff flags
						let sourceFile: string | undefined
						let diffFile: string | undefined

						for (let i = 0; i < args.length; i++) {
							if (args[i] === "--source" && i + 1 < args.length) {
								sourceFile = args[i + 1]
								i++ // Skip the next argument as it's the value
							} else if (args[i] === "--diff" && i + 1 < args.length) {
								diffFile = args[i + 1]
								i++ // Skip the next argument as it's the value
							}
						}

						if (!sourceFile || !diffFile) {
							console.debug(
								`Optional debug usage: npx jest multi-search-replace.test.ts -- --source <file.ts> --diff <diff.diff>\n`,
							)
							// console.debug('All args:', args);
							return
						}

						try {
							// Read files
							const fs = require("fs")
							const sourceContent = fs.readFileSync(sourceFile, "utf8")
							let diffContent = fs.readFileSync(diffFile, "utf8")

							// Show first 50 lines of source content
							process.stdout.write(
								`\n\n====================================================================\n`,
							)
							process.stdout.write(`== ${sourceFile} first 50 lines ==\n`)
							process.stdout.write(
								`====================================================================\n`,
							)
							sourceContent
								.split("\n")
								.slice(0, 50)
								.forEach((line: string) => {
									process.stdout.write(`${line}\n`)
								})
							process.stdout.write(
								`=============================== END ================================\n`,
							)

							process.stdout.write(
								`\n\n====================================================================\n`,
							)
							process.stdout.write(`== ${diffFile} first 50 lines ==\n`)
							process.stdout.write(
								`====================================================================\n`,
							)

							// Show first 50 lines of diff content
							diffContent
								.split("\n")
								.slice(0, 50)
								.forEach((line: string) => {
									process.stdout.write(`${line}\n`)
								})
							process.stdout.write(
								`=============================== END ================================\n`,
							)

							// Apply the diff
							const result = await strategy.applyDiff(sourceContent, diffContent)

							if (result.success) {
								process.stdout.write(
									`\n\n====================================================================\n`,
								)
								process.stdout.write(`== Diff applied successfully ==\n`)
								process.stdout.write(
									`====================================================================\n`,
								)
								process.stdout.write(result.content + "\n")
								process.stdout.write(
									`=============================== END ================================\n`,
								)
								expect(result.success).toBe(true)
							} else {
								process.stdout.write(
									`\n\n====================================================================\n`,
								)
								process.stdout.write(`== Failed to apply diff ==\n`)
								process.stdout.write(
									`====================================================================\n\n\n`,
								)
								console.error(result)
								process.stdout.write(
									`=============================== END ================================\n\n\n`,
								)
							}
						} catch (err) {
							console.error("Error processing files:", err.message)
							console.error("Stack trace:", err.stack)
						}
					})
				})
			})

			it("should not strip content that starts with pipe but no line number", async () => {
				const originalContent = "| Pipe\n|---|\n| Data\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
| Pipe
|---|
| Data
=======
| Pipe
|---|
| Updated
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("| Pipe\n|---|\n| Updated\n")
				}
			})

			it("should handle mix of line-numbered and pipe-only content", async () => {
				const originalContent = "| Pipe\n|---|\n| Data\n"
				const diffContent = `test.ts
<<<<<<< SEARCH
| Pipe
|---|
| Data
=======
1 | | Pipe
2 | |---|
3 | | NewData
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("1 | | Pipe\n2 | |---|\n3 | | NewData\n")
				}
			})
		})
	})

	describe("deletion", () => {
		let strategy: MultiSearchReplaceDiffStrategy

		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy()
		})

		describe("deletion", () => {
			it("should delete code when replace block is empty", async () => {
				const originalContent = `function test() {
    console.log("hello");
    // Comment to remove
    console.log("world");
}`
				const diffContent = `test.ts
<<<<<<< SEARCH
    // Comment to remove
=======
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`function test() {
    console.log("hello");
    console.log("world");
}`)
				}
			})

			it("should delete multiple lines when replace block is empty", async () => {
				const originalContent = `class Example {
    constructor() {
        // Initialize
        this.value = 0;
        // Set defaults
        this.name = "";
        // End init
    }
}`
				const diffContent = `test.ts
<<<<<<< SEARCH
        // Initialize
        this.value = 0;
        // Set defaults
        this.name = "";
        // End init
=======
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`class Example {
    constructor() {
    }
}`)
				}
			})

			it("should preserve indentation when deleting nested code", async () => {
				const originalContent = `function outer() {
    if (true) {
        // Remove this
        console.log("test");
        // And this
    }
    return true;
}`
				const diffContent = `test.ts
<<<<<<< SEARCH
        // Remove this
        console.log("test");
        // And this
=======
>>>>>>> REPLACE`

				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe(`function outer() {
    if (true) {
    }
    return true;
}`)
				}
			})

			it("should delete a line when search block has line number prefix and replace is empty", async () => {
				const originalContent = "line 1\nline to delete\nline 3"
				const diffContent = `
<<<<<<< SEARCH
:start_line:2
-------
2 | line to delete
=======
>>>>>>> REPLACE`
				const result = await strategy.applyDiff(originalContent, diffContent)
				expect(result.success).toBe(true)
				if (result.success) {
					expect(result.content).toBe("line 1\nline 3")
				}
			})
		})
	})

	describe("fuzzy matching", () => {
		let strategy: MultiSearchReplaceDiffStrategy
		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy(0.9, 5) // 90% similarity threshold, 5 line buffer for tests
		})

		it("should match content with small differences (>90% similar)", async () => {
			const originalContent =
				"function getData() {\n    const results = fetchData();\n    return results.filter(Boolean);\n}\n"
			const diffContent = `test.ts
<<<<<<< SEARCH
function getData() {
    const result = fetchData();
    return results.filter(Boolean);
}
=======
function getData() {
    const data = fetchData();
    return data.filter(Boolean);
}
>>>>>>> REPLACE`

			strategy = new MultiSearchReplaceDiffStrategy(0.9, 5) // Use 5 line buffer for tests

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(
					"function getData() {\n    const data = fetchData();\n    return data.filter(Boolean);\n}\n",
				)
			}
		})

		it("should not match when content is too different (<90% similar)", async () => {
			const originalContent = "function processUsers(data) {\n    return data.map(user => user.name);\n}\n"
			const diffContent = `test.ts
<<<<<<< SEARCH
function handleItems(items) {
    return items.map(item => item.username);
}
=======
function processData(data) {
    return data.map(d => d.value);
}
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(false)
		})

		it("should match content with extra whitespace", async () => {
			const originalContent = "function sum(a, b) {\n    return a + b;\n}"
			const diffContent = `test.ts
<<<<<<< SEARCH
function   sum(a,   b)    {
    return    a + b;
}
=======
function sum(a, b) {
    return a + b + 1;
}
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe("function sum(a, b) {\n    return a + b + 1;\n}")
			}
		})

		it("should match content with smart quotes", async () => {
			const originalContent =
				"**Enjoy Zentara Code!** Whether you keep it on a short leash or let it roam autonomously, we can’t wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/ZentaraCode/) or [Discord](https://discord.gg/ZentaraCode). Happy coding!"
			const diffContent = `test.ts
<<<<<<< SEARCH
**Enjoy Zentara Code!** Whether you keep it on a short leash or let it roam autonomously, we can’t wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/ZentaraCode/) or [Discord](https://discord.gg/ZentaraCode). Happy coding!
=======
**Enjoy Zentara Code!** Whether you keep it on a short leash or let it roam autonomously, we can't wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/ZentaraCode/) or [Discord](https://discord.gg/ZentaraCode). Happy coding!

You're still here?
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(
					"**Enjoy Zentara Code!** Whether you keep it on a short leash or let it roam autonomously, we can't wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/ZentaraCode/) or [Discord](https://discord.gg/ZentaraCode). Happy coding!\n\nYou're still here?",
				)
			}
		})

		it("should not exact match empty lines", async () => {
			const originalContent = "function sum(a, b) {\n\n    return a + b;\n}"
			const diffContent = `test.ts
<<<<<<< SEARCH
function sum(a, b) {
=======
import { a } from "a";
function sum(a, b) {
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe('import { a } from "a";\nfunction sum(a, b) {\n\n    return a + b;\n}')
			}
		})
	})

	describe("line-constrained search", () => {
		let strategy: MultiSearchReplaceDiffStrategy

		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy(0.9, 5)
		})

		it("should find and replace within specified line range", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return 3;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function two() {
    return 2;
}
=======
function two() {
    return "two";
}
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent, 5)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function two() {
    return "two";
}

function three() {
    return 3;
}`)
			}
		})

		it("should find and replace within buffer zone (5 lines before/after)", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return 3;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function three() {
    return 3;
}
=======
function three() {
    return "three";
}
>>>>>>> REPLACE`

			// Even though we specify lines 5-7, it should still find the match at lines 9-11
			// because it's within the 5-line buffer zone
			const result = await strategy.applyDiff(originalContent, diffContent, 5)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return "three";
}`)
			}
		})

		it("should work correctly on this example with line numbers that are slightly off", async () => {
			const originalContent = `.game-container {
display: flex;
flex-direction: column;
gap: 1rem;
}

.chess-board-container {
display: flex;
gap: 1rem;
align-items: center;
}

.overlay {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
z-index: 999; /* Ensure it's above the board but below the promotion dialog */
}

.game-container.promotion-active .chess-board,
.game-container.promotion-active .game-toolbar,
.game-container.promotion-active .game-info-container {
filter: blur(2px);
pointer-events: none; /* Disable clicks on these elements */
}

.game-container.promotion-active .promotion-dialog {
z-index: 1000; /* Ensure it's above the overlay */
pointer-events: auto; /* Enable clicks on the promotion dialog */
}`
			const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:12
-------
.overlay {
=======
.piece {
will-change: transform;
}

.overlay {
>>>>>>> REPLACE
`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`.game-container {
display: flex;
flex-direction: column;
gap: 1rem;
}

.chess-board-container {
display: flex;
gap: 1rem;
align-items: center;
}

.piece {
will-change: transform;
}

.overlay {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
z-index: 999; /* Ensure it's above the board but below the promotion dialog */
}

.game-container.promotion-active .chess-board,
.game-container.promotion-active .game-toolbar,
.game-container.promotion-active .game-info-container {
filter: blur(2px);
pointer-events: none; /* Disable clicks on these elements */
}

.game-container.promotion-active .promotion-dialog {
z-index: 1000; /* Ensure it's above the overlay */
pointer-events: auto; /* Enable clicks on the promotion dialog */
}`)
			}
		})

		it("should not find matches outside search range and buffer zone", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return 3;
}

function four() {
    return 4;
}

function five() {
    return 5;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:5
-------
function five() {
    return 5;
}
=======
function five() {
    return "five";
}
>>>>>>> REPLACE`

			// Searching around function two() (lines 5-7)
			// function five() is more than 5 lines away, so it shouldn't match
			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(false)
		})

		it("should handle search range at start of file", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function one() {
    return 1;
}
=======
function one() {
    return "one";
}
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent, 1)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return "one";
}

function two() {
    return 2;
}`)
			}
		})

		it("should handle search range at end of file", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function two() {
    return 2;
}
=======
function two() {
    return "two";
}
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent, 5)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function two() {
    return "two";
}`)
			}
		})

		it("should match specific instance of duplicate code using line numbers", async () => {
			const originalContent = `
function processData(data) {
    return data.map(x => x * 2);
}

function unrelatedStuff() {
    console.log("hello");
}

// Another data processor
function processData(data) {
    return data.map(x => x * 2);
}

function moreStuff() {
    console.log("world");
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function processData(data) {
    return data.map(x => x * 2);
}
=======
function processData(data) {
    // Add logging
    console.log("Processing data...");
    return data.map(x => x * 2);
}
>>>>>>> REPLACE`

			// Target the second instance of processData
			const result = await strategy.applyDiff(originalContent, diffContent, 10)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function processData(data) {
    return data.map(x => x * 2);
}

function unrelatedStuff() {
    console.log("hello");
}

// Another data processor
function processData(data) {
    // Add logging
    console.log("Processing data...");
    return data.map(x => x * 2);
}

function moreStuff() {
    console.log("world");
}`)
			}
		})

		it("should search from start line to end of file when only start_line is provided", async () => {
			const originalContent = `
function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return 3;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function three() {
    return 3;
}
=======
function three() {
    return "three";
}
>>>>>>> REPLACE`

			// Only provide start_line, should search from there to end of file
			const result = await strategy.applyDiff(originalContent, diffContent, 8)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function two() {
    return 2;
}

function three() {
    return "three";
}`)
			}
		})

		it("should prioritize exact line match over expanded search", async () => {
			const originalContent = `
function one() {
    return 1;
}

function process() {
    return "old";
}

function process() {
    return "old";
}

function two() {
    return 2;
}`
			const diffContent = `test.ts
<<<<<<< SEARCH
function process() {
    return "old";
}
=======
function process() {
    return "new";
}
>>>>>>> REPLACE`

			// Should match the second instance exactly at lines 10-12
			// even though the first instance at 6-8 is within the expanded search range
			const result = await strategy.applyDiff(originalContent, diffContent, 10)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`
function one() {
    return 1;
}

function process() {
    return "old";
}

function process() {
    return "new";
}

function two() {
    return 2;
}`)
			}
		})

		it("should fall back to expanded search only if exact match fails", async () => {
			const originalContent = `
function one() {
    return 1;
}

function process() {
    return "target";
}

function two() {
    return 2;
}`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
function process() {
    return "target";
}
=======
function process() {
    return "updated";
}
>>>>>>> REPLACE`

			// Specify wrong line numbers (3-5), but content exists at 6-8
			// Should still find and replace it since it's within the expanded range
			const result = await strategy.applyDiff(originalContent, diffContent, 3)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function process() {
    return "updated";
}

function two() {
    return 2;
}`)
			}
		})

		it("should fail when line range is far outside file bounds", async () => {
			const originalContent = `
function one() {
		  return 1;
}

function two() {
		  return 2;
}

function three() {
		  return 3;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:1000
-------
function three() {
		  return 3;
}
=======
function three() {
		  return "three";
}
>>>>>>> REPLACE`

			// Line 1000 is way outside the bounds of the file (10 lines)
			// and outside of any reasonable buffer range, so it should fail
			const result = await strategy.applyDiff(originalContent, diffContent, 1000)
			expect(result.success).toBe(false)
		})

		it("should find match when line range is slightly out of bounds but within buffer zone", async () => {
			const originalContent = `
function one() {
		  return 1;
}

function two() {
		  return 2;
}

function three() {
		  return 3;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
:start_line:11
-------
function three() {
		  return 3;
}
=======
function three() {
		  return "three";
}
>>>>>>> REPLACE`

			// File only has 10 lines, but we specify line 11
			// It should still find the match since it's within the buffer zone (5 lines)
			const result = await strategy.applyDiff(originalContent, diffContent, 11)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
		  return 1;
}

function two() {
		  return 2;
}

function three() {
		  return "three";
}`)
			}
		})

		it("should deduce start_line when include line number in search and replace content", async () => {
			const originalContent = `
function one() {
    return 1;
}

function process() {
    return "target";
}

function process() {
    return "target";
}

function two() {
    return 2;
}
`.trim()
			const diffContent = `test.ts
<<<<<<< SEARCH
9 | function process() {
10 |     return "target";
=======
9 | function process2() {
10 |     return "target222";
>>>>>>> REPLACE`

			const result = await strategy.applyDiff(originalContent, diffContent)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.content).toBe(`function one() {
    return 1;
}

function process() {
    return "target";
}

function process2() {
    return "target222";
}

function two() {
    return 2;
}`)
			}
		})
	})

	describe("getToolDescription", () => {
		let strategy: MultiSearchReplaceDiffStrategy

		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy()
		})

		it("should include the current workspace directory", async () => {
			const cwd = "/test/dir"
			const description = await strategy.getToolDescription({ cwd })
			expect(description).toContain(`relative to the current workspace directory ${cwd}`)
		})

		it("should include required format elements", async () => {
			const description = await strategy.getToolDescription({ cwd: "/test" })
			expect(description).toContain("<<<<<<< SEARCH")
			expect(description).toContain("=======")
			expect(description).toContain(">>>>>>> REPLACE")
			expect(description).toContain("<apply_diff>")
			expect(description).toContain("</apply_diff>")
		})
	})

	describe("line marker validation in REPLACE sections", () => {
		let strategy: MultiSearchReplaceDiffStrategy

		beforeEach(() => {
			strategy = new MultiSearchReplaceDiffStrategy()
		})

		it("should reject start_line marker in REPLACE section", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				":start_line:5\n" +
				"replacement content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':start_line:' found in REPLACE section")
			expect(result.error).toContain(
				"Line markers (:start_line: and :end_line:) are only allowed in SEARCH sections",
			)
		})

		it("should reject end_line marker in REPLACE section", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				":end_line:10\n" +
				"replacement content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':end_line:' found in REPLACE section")
			expect(result.error).toContain(
				"Line markers (:start_line: and :end_line:) are only allowed in SEARCH sections",
			)
		})

		it("should reject both line markers in REPLACE section", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				":start_line:5\n" +
				":end_line:10\n" +
				"replacement content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':start_line:' found in REPLACE section")
		})

		it("should reject line markers in multiple diff blocks where one has invalid markers", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				":start_line:1\n" +
				"content1\n" +
				"=======\n" +
				"replacement1\n" +
				">>>>>>> REPLACE\n\n" +
				"<<<<<<< SEARCH\n" +
				"content2\n" +
				"=======\n" +
				":start_line:5\n" +
				"replacement2\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':start_line:' found in REPLACE section")
		})

		it("should allow valid markers in SEARCH section with content in REPLACE", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				":start_line:5\n" +
				":end_line:10\n" +
				"-------\n" +
				"content to find\n" +
				"=======\n" +
				"replacement content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(true)
		})

		it("should allow escaped line markers in REPLACE content", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				"replacement content\n" +
				"\\:start_line:5\n" +
				"more content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(true)
		})

		it("should allow escaped end_line markers in REPLACE content", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				"replacement content\n" +
				"\\:end_line:10\n" +
				"more content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(true)
		})

		it("should allow both escaped line markers in REPLACE content", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				"replacement content\n" +
				"\\:start_line:5\n" +
				"\\:end_line:10\n" +
				"more content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(true)
		})

		it("should reject line markers with whitespace in REPLACE section", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				"  :start_line:5  \n" +
				"replacement content\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':start_line:' found in REPLACE section")
		})

		it("should reject line markers in middle of REPLACE content", () => {
			const diff =
				"<<<<<<< SEARCH\n" +
				"content to find\n" +
				"=======\n" +
				"some replacement\n" +
				":end_line:15\n" +
				"more replacement\n" +
				">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("Invalid line marker ':end_line:' found in REPLACE section")
		})

		it("should provide helpful error message format", () => {
			const diff =
				"<<<<<<< SEARCH\n" + "content\n" + "=======\n" + ":start_line:5\n" + "replacement\n" + ">>>>>>> REPLACE"
			const result = strategy["validateMarkerSequencing"](diff)
			expect(result.success).toBe(false)
			expect(result.error).toContain("CORRECT FORMAT:")
			expect(result.error).toContain("INCORRECT FORMAT:")
			expect(result.error).toContain(":start_line:5    <-- Invalid location")
		})
	})
})
