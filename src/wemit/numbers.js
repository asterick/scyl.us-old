// TODO: MEMORY
// TODO: OPERATORS
// TODO: i32 SELECT

import Binder from "./binder";

export class NumberType extends Binder {
	constructor (init = null) {
		super();

		// Inital values
		this._name = null;

		// Strings that do not begin with a digit are a name
		if (typeof init === "string" && !/^[0-9]/.test(init)) {
			this._name = init;
			init = null;
		}

		this._value = init;
	}

	bind(context) {
		this.mixin(context);
	}

	same(other) {
		return this.constructor === other.constructor;
	}

	get type() {
		return this.constructor.type;
	}
}
NumberType.autoBind = [];

export class Int32Type extends NumberType {
	static get type() { return "i32"; }
}

export class Int64Type extends NumberType {
	static get type() { return "i64"; }
}

export class Float32Type extends NumberType {
	static get type() { return "f32"; }
}

export class Float64Type extends NumberType {
	static get type() { return "f64"; }
}

// Helper functions for short syntax
export function i32(...args) { return new Int32Type(... args); }
i32.base = Int32Type;

export function i64(...args) { return new Int64Type(... args); }
i64.base = Int64Type;

export function f32(...args) { return new Float32Type(... args); }
f32.base = Float32Type;

export function f64(...args) { return new Float64Type(... args); }
f64.base = Float64Type;
