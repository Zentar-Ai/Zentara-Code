import type { ZentaraTerminalProcess, ZentaraTerminalProcessResultPromise } from "./types"

// Similar to execa's ResultPromise, this lets us create a mixin of both a
// TerminalProcess and a Promise:
// https://github.com/sindresorhus/execa/blob/main/lib/methods/promise.js
export function mergePromise(process: ZentaraTerminalProcess, promise: Promise<void>): ZentaraTerminalProcessResultPromise {
	const nativePromisePrototype = (async () => {})().constructor.prototype

	const descriptors = ["then", "catch", "finally"].map(
		(property) => [property, Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)] as const,
	)

	for (const [property, descriptor] of descriptors) {
		if (descriptor) {
			const value = descriptor.value.bind(promise)
			Reflect.defineProperty(process, property, { ...descriptor, value })
		}
	}

	return process as ZentaraTerminalProcessResultPromise
}
