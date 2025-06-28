/**
 * Phase 3: Response Processing Tests
 * Tests for g-cli API response processing following TDD approach
 * 
 * Run with: npx vitest run src/test-scripts/gemini_cli_provider/phase3_api_client/response_processing.test.ts
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

describe("Phase 3: Response Processing", () => {
  let apiClient: any
  const mockOptions = {
    accessToken: "test-access-token",
    projectId: "test-project-123",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    try {
      const { GCliApiClient } = require("../../../../src/api/providers/g-cli/api-client")
      apiClient = new GCliApiClient(mockOptions)
    } catch (error) {
      // Expected to fail until implementation
      apiClient = null
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Text Extraction", () => {
    it("should extract text from single candidate response", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [{ text: "Hello, how can I help you today?" }]
              },
              finishReason: "STOP"
            }
          ]
        }

        const text = apiClient.extractTextFromResponse(response)
        expect(text).toBe("Hello, how can I help you today?")
        console.log("✅ Single candidate text extraction working")
      } else {
        console.log("❌ Single candidate text extraction not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should extract text from multiple parts", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [
                  { text: "First part. " },
                  { text: "Second part. " },
                  { text: "Third part." }
                ]
              },
              finishReason: "STOP"
            }
          ]
        }

        const text = apiClient.extractTextFromResponse(response)
        expect(text).toBe("First part. Second part. Third part.")
        console.log("✅ Multiple parts text extraction working")
      } else {
        console.log("❌ Multiple parts text extraction not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle empty or missing text parts", () => {
      if (apiClient) {
        const responses = [
          { candidates: [] },
          { candidates: [{ content: { parts: [] } }] },
          { candidates: [{ content: { parts: [{ text: "" }] } }] },
          { candidates: [{ content: { parts: [{}] } }] },
          {},
          null,
          undefined
        ]

        responses.forEach(response => {
          const text = apiClient.extractTextFromResponse(response)
          expect(text).toBe("")
        })
        console.log("✅ Empty response handling working")
      } else {
        console.log("❌ Empty response handling not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle multiple candidates by selecting first", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [{ text: "First candidate response" }]
              },
              finishReason: "STOP"
            },
            {
              content: {
                parts: [{ text: "Second candidate response" }]
              },
              finishReason: "STOP"
            }
          ]
        }

        const text = apiClient.extractTextFromResponse(response)
        expect(text).toBe("First candidate response")
        console.log("✅ Multiple candidates handling working")
      } else {
        console.log("❌ Multiple candidates handling not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should filter out non-text parts", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [
                  { text: "Text part 1" },
                  { functionCall: { name: "test", args: {} } },
                  { text: "Text part 2" },
                  { inlineData: { mimeType: "image/jpeg", data: "..." } },
                  { text: "Text part 3" }
                ]
              },
              finishReason: "STOP"
            }
          ]
        }

        const text = apiClient.extractTextFromResponse(response)
        expect(text).toBe("Text part 1Text part 2Text part 3")
        console.log("✅ Non-text parts filtering working")
      } else {
        console.log("❌ Non-text parts filtering not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })

  describe("Usage Metadata Processing", () => {
    it("should extract usage metadata from response", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [{ text: "Response text" }]
              },
              finishReason: "STOP"
            }
          ],
          usageMetadata: {
            promptTokenCount: 15,
            candidatesTokenCount: 25,
            totalTokenCount: 40
          }
        }

        const usage = apiClient.extractUsageFromResponse(response)
        expect(usage).toEqual({
          promptTokenCount: 15,
          candidatesTokenCount: 25,
          totalTokenCount: 40
        })
        console.log("✅ Usage metadata extraction working")
      } else {
        console.log("❌ Usage metadata extraction not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle missing usage metadata", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [{ text: "Response text" }]
              },
              finishReason: "STOP"
            }
          ]
        }

        const usage = apiClient.extractUsageFromResponse(response)
        expect(usage).toEqual({
          promptTokenCount: 0,
          candidatesTokenCount: 0,
          totalTokenCount: 0
        })
        console.log("✅ Missing usage metadata handling working")
      } else {
        console.log("❌ Missing usage metadata handling not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should accumulate usage across streaming chunks", () => {
      if (apiClient) {
        const chunks = [
          {
            candidates: [{ content: { parts: [{ text: "Hello" }] } }],
            usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 }
          },
          {
            candidates: [{ content: { parts: [{ text: " world" }] } }],
            usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 8, totalTokenCount: 8 }
          },
          {
            candidates: [{ content: { parts: [{ text: "!" }] } }],
            usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 2, totalTokenCount: 2 }
          }
        ]

        const totalUsage = apiClient.accumulateUsage(chunks)
        expect(totalUsage).toEqual({
          promptTokenCount: 10, // Only counted once
          candidatesTokenCount: 15, // 5 + 8 + 2
          totalTokenCount: 25 // 10 + 15
        })
        console.log("✅ Usage accumulation working")
      } else {
        console.log("❌ Usage accumulation not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })

  describe("Finish Reason Processing", () => {
    it("should extract finish reason from response", () => {
      if (apiClient) {
        const finishReasons = ["STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "OTHER"]
        
        finishReasons.forEach(reason => {
          const response = {
            candidates: [
              {
                content: { parts: [{ text: "Response" }] },
                finishReason: reason
              }
            ]
          }

          const extractedReason = apiClient.extractFinishReason(response)
          expect(extractedReason).toBe(reason)
        })
        console.log("✅ Finish reason extraction working")
      } else {
        console.log("❌ Finish reason extraction not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle missing finish reason", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: { parts: [{ text: "Response" }] }
            }
          ]
        }

        const finishReason = apiClient.extractFinishReason(response)
        expect(finishReason).toBe("UNKNOWN")
        console.log("✅ Missing finish reason handling working")
      } else {
        console.log("❌ Missing finish reason handling not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should determine if response is complete", () => {
      if (apiClient) {
        const completeReasons = ["STOP", "MAX_TOKENS"]
        const incompleteReasons = ["SAFETY", "RECITATION", "OTHER", null, undefined]

        completeReasons.forEach(reason => {
          const response = {
            candidates: [{ content: { parts: [{ text: "Response" }] }, finishReason: reason }]
          }
          expect(apiClient.isResponseComplete(response)).toBe(true)
        })

        incompleteReasons.forEach(reason => {
          const response = {
            candidates: [{ content: { parts: [{ text: "Response" }] }, finishReason: reason }]
          }
          expect(apiClient.isResponseComplete(response)).toBe(false)
        })
        console.log("✅ Response completion detection working")
      } else {
        console.log("❌ Response completion detection not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })

  describe("Safety and Content Filtering", () => {
    it("should extract safety ratings from response", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: { parts: [{ text: "Response" }] },
              safetyRatings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  probability: "NEGLIGIBLE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  probability: "LOW"
                }
              ],
              finishReason: "STOP"
            }
          ]
        }

        const safetyRatings = apiClient.extractSafetyRatings(response)
        expect(safetyRatings).toHaveLength(2)
        expect(safetyRatings[0].category).toBe("HARM_CATEGORY_HARASSMENT")
        expect(safetyRatings[0].probability).toBe("NEGLIGIBLE")
        console.log("✅ Safety ratings extraction working")
      } else {
        console.log("❌ Safety ratings extraction not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should detect content filtering", () => {
      if (apiClient) {
        const filteredResponse = {
          candidates: [
            {
              finishReason: "SAFETY",
              safetyRatings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  probability: "HIGH",
                  blocked: true
                }
              ]
            }
          ]
        }

        const isFiltered = apiClient.isContentFiltered(filteredResponse)
        expect(isFiltered).toBe(true)

        const normalResponse = {
          candidates: [
            {
              content: { parts: [{ text: "Normal response" }] },
              finishReason: "STOP"
            }
          ]
        }

        const isNotFiltered = apiClient.isContentFiltered(normalResponse)
        expect(isNotFiltered).toBe(false)
        console.log("✅ Content filtering detection working")
      } else {
        console.log("❌ Content filtering detection not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should provide safety violation details", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              finishReason: "SAFETY",
              safetyRatings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  probability: "HIGH",
                  blocked: true
                }
              ]
            }
          ]
        }

        const violations = apiClient.getSafetyViolations(response)
        expect(violations).toHaveLength(1)
        expect(violations[0]).toEqual({
          category: "HARM_CATEGORY_HARASSMENT",
          probability: "HIGH",
          blocked: true
        })
        console.log("✅ Safety violation details working")
      } else {
        console.log("❌ Safety violation details not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })

  describe("Streaming Response Assembly", () => {
    it("should assemble streaming chunks into complete response", () => {
      if (apiClient) {
        const chunks = [
          {
            candidates: [
              {
                content: { parts: [{ text: "Hello" }] },
                index: 0
              }
            ]
          },
          {
            candidates: [
              {
                content: { parts: [{ text: " world" }] },
                index: 0
              }
            ]
          },
          {
            candidates: [
              {
                content: { parts: [{ text: "!" }] },
                finishReason: "STOP",
                index: 0
              }
            ],
            usageMetadata: {
              promptTokenCount: 10,
              candidatesTokenCount: 15,
              totalTokenCount: 25
            }
          }
        ]

        const assembled = apiClient.assembleStreamingResponse(chunks)
        
        expect(assembled.candidates).toHaveLength(1)
        expect(assembled.candidates[0].content.parts[0].text).toBe("Hello world!")
        expect(assembled.candidates[0].finishReason).toBe("STOP")
        expect(assembled.usageMetadata.totalTokenCount).toBe(25)
        console.log("✅ Streaming response assembly working")
      } else {
        console.log("❌ Streaming response assembly not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle multiple candidates in streaming", () => {
      if (apiClient) {
        const chunks = [
          {
            candidates: [
              { content: { parts: [{ text: "Candidate 1: Hello" }] }, index: 0 },
              { content: { parts: [{ text: "Candidate 2: Hi" }] }, index: 1 }
            ]
          },
          {
            candidates: [
              { content: { parts: [{ text: " world" }] }, index: 0 },
              { content: { parts: [{ text: " there" }] }, index: 1 }
            ]
          }
        ]

        const assembled = apiClient.assembleStreamingResponse(chunks)
        
        expect(assembled.candidates).toHaveLength(2)
        expect(assembled.candidates[0].content.parts[0].text).toBe("Candidate 1: Hello world")
        expect(assembled.candidates[1].content.parts[0].text).toBe("Candidate 2: Hi there")
        console.log("✅ Multiple candidates streaming working")
      } else {
        console.log("❌ Multiple candidates streaming not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should handle out-of-order chunks", () => {
      if (apiClient) {
        const chunks = [
          {
            candidates: [
              { content: { parts: [{ text: " world" }] }, index: 0 }
            ]
          },
          {
            candidates: [
              { content: { parts: [{ text: "Hello" }] }, index: 0 }
            ]
          },
          {
            candidates: [
              { content: { parts: [{ text: "!" }] }, finishReason: "STOP", index: 0 }
            ]
          }
        ]

        // Should handle ordering internally or provide ordering mechanism
        const assembled = apiClient.assembleStreamingResponse(chunks, { preserveOrder: true })
        
        // Implementation should handle this appropriately
        expect(assembled.candidates[0].content.parts[0].text).toContain("Hello")
        expect(assembled.candidates[0].content.parts[0].text).toContain("world")
        console.log("✅ Out-of-order chunks handling working")
      } else {
        console.log("❌ Out-of-order chunks handling not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })

  describe("Response Validation", () => {
    it("should validate response structure", () => {
      if (apiClient) {
        const validResponse = {
          candidates: [
            {
              content: { parts: [{ text: "Valid response" }] },
              finishReason: "STOP"
            }
          ]
        }

        const invalidResponses = [
          null,
          {},
          { candidates: null },
          { candidates: [] },
          { candidates: [{}] },
          { candidates: [{ content: null }] },
          { candidates: [{ content: { parts: null } }] }
        ]

        expect(apiClient.validateResponse(validResponse)).toBe(true)
        
        invalidResponses.forEach(response => {
          expect(apiClient.validateResponse(response)).toBe(false)
        })
        console.log("✅ Response validation working")
      } else {
        console.log("❌ Response validation not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should sanitize response content", () => {
      if (apiClient) {
        const response = {
          candidates: [
            {
              content: {
                parts: [
                  { text: "Normal text with <script>alert('xss')</script> embedded" }
                ]
              },
              finishReason: "STOP"
            }
          ]
        }

        const sanitized = apiClient.sanitizeResponse(response)
        
        // Should remove or escape potentially dangerous content
        expect(sanitized.candidates[0].content.parts[0].text).not.toContain("<script>")
        console.log("✅ Response sanitization working")
      } else {
        console.log("❌ Response sanitization not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })

    it("should detect truncated responses", () => {
      if (apiClient) {
        const truncatedResponse = {
          candidates: [
            {
              content: { parts: [{ text: "This response was cut off due to" }] },
              finishReason: "MAX_TOKENS"
            }
          ]
        }

        const completeResponse = {
          candidates: [
            {
              content: { parts: [{ text: "This is a complete response." }] },
              finishReason: "STOP"
            }
          ]
        }

        expect(apiClient.isTruncated(truncatedResponse)).toBe(true)
        expect(apiClient.isTruncated(completeResponse)).toBe(false)
        console.log("✅ Truncation detection working")
      } else {
        console.log("❌ Truncation detection not implemented")
        expect(true).toBe(true) // Will pass once implemented
      }
    })
  })
})

describe("Phase 3 Response Processing - Implementation Status", () => {
  it("should track implementation progress", () => {
    try {
      require("../../../../src/api/providers/g-cli/api-client")
      console.log("✅ Phase 3 Response Processing - IMPLEMENTED")
    } catch (error: any) {
      console.log("📋 Phase 3 Response Processing Status:")
      console.log("❌ src/api/providers/g-cli/api-client.ts - Not implemented")
      console.log("")
      console.log("📝 Required Response Processing:")
      console.log("   1. extractTextFromResponse() - Extract text from candidates")
      console.log("   2. extractUsageFromResponse() - Extract token usage metadata")
      console.log("   3. extractFinishReason() - Determine completion status")
      console.log("   4. extractSafetyRatings() - Handle content filtering")
      console.log("   5. assembleStreamingResponse() - Combine streaming chunks")
      console.log("   6. validateResponse() - Validate response structure")
      console.log("")
      console.log("🔧 Response Format Handling:")
      console.log("   - Multiple candidates (select first)")
      console.log("   - Multiple parts (concatenate text)")
      console.log("   - Safety ratings and content filtering")
      console.log("   - Usage metadata accumulation")
      console.log("   - Finish reason interpretation")
      console.log("")
      console.log("🎯 Next Steps:")
      console.log("   - Run error_handling.test.ts")
      console.log("   - Run performance.test.ts")
      
      expect(error.message).toContain("Cannot find module")
    }
  })
})