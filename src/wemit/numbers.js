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
		this._context = context;
		this.mixin(context);
	}

	same(other) {
		if (typeof other === 'number') {
			return new this.constructor(other);
		}

		if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
			return new this.constructor({ type: "cast", signed: this.signed, value: other });
		}

		return other;
	}

	get variable() {
		return this._context instanceof Scope || this._context instanceof Module;
	}

	get value() {
		return this._value;
	}

	get type() {
		return this.constructor.type;
	}
}
NumberType.autoBind = [];

export class Int32Type extends NumberType {
	/*
	load
	store
	store8
	store16
	eq
	ne
	clz
	ctz
	popcnt
	add
	sub
	mul
	and
	or
	xor
	shl
	rotl
	rotr
	load8
	load16
	div
	rem
	shr
	*/

	select(a, b) {
		b = a.same(b);
		return new a.constructor({ type: "select", compare: this, "true": a, "false": b });
	}

	eqz() {
		return i32({ type: "equalZero", value: this });
	}

	eq(compare) {
		compare = this.same(compare);
		return i32({ type: "equal", left: this, right: compare });
	}

	lt(compare) {
		compare = this.same(compare);
		return i32({ type: "lessThan", signed: this.signed, left: this, right: compare });
	}

	gt(compare) {
		compare = this.same(compare);
		return i32({ type: "greaterThan", signed: this.signed, left: this, right: compare });
	}

	le(compare) {
		compare = this.same(compare);
		return i32({ type: "lessEqual", signed: this.signed, left: this, right: compare });
	}

	ge(compare) {
		compare = this.same(compare);
		return i32({ type: "greaterEqual", signed: this.signed, left: this, right: compare });
	}

	cast(type) {
		return type({ type: "cast", signed: this.signed, value: this });
	}

	reinterpret() {
		return f32({ type: "reinterpret", value: this });
	}
}

export class SignedInt32Type extends Int32Type {
	get unsigned() {
		return u32(this._value);
	}

	static get signed() { return true; }
	static get type() { return "s32"; }
}

export class UnsignedInt32Type extends Int32Type {
	get signed() {
		return s32(this._value);
	}

	static get signed() { return false; }
	static get type() { return "u32"; }
}

export class Int64Type extends NumberType {
	/*
	load
	store
	store8
	store16
	store32
	eqz
	eq
	ne
	clz
	ctz
	popcnt
	add
	sub
	mul
	div
	rem
	and
	or
	xor
	shl
	rotl
	rotr
	load8
	load16
	load32
	*/

	eqz(compare) {
		return i32({ type: "equalZero", value: this });
	}

	eq(compare) {
		return i32({ type: "equal", left: this, right: compare });
	}

	lt(compare) {
		return i32({ type: "lessThan", signed: this.signed, left: this, right: compare });
	}

	gt(compare) {
		return i32({ type: "greaterThan", signed: this.signed, left: this, right: compare });
	}

	le(compare) {
		return i32({ type: "lessEqual", signed: this.signed, left: this, right: compare });
	}

	ge(compare) {
		return i32({ type: "greaterEqual", signed: this.signed, left: this, right: compare });
	}

	shr(compare) {
		return i64({ type: "shiftRight", signed: this.signed, left: this, right: compare });
	}

	cast(type) {
		return type({ type: "cast", signed: this.signed, value: this });
	}

	reinterpret() {
		return f64({ type: "reinterpret", value: this });
	}
}

export class SignedInt64Type extends Int64Type {
	get unsigned() {
		return u64(this._value);
	}

	static get signed() { return true; }
	static get type() { return "s64"; }
}

export class UnsignedInt64Type extends Int64Type {
	get signed() {
		return s64(this._value);
	}

	static get signed() { return false; }
	static get type() { return "u64"; }
}

export class Float32Type extends NumberType {
	/*
	load
	store
	eq
	ne
	lt
	gt
	le
	ge
	abs
	neg
	ceil
	floor
	trunc
	nearest
	sqrt
	add
	sub
	mul
	div
	min
	max
	copysign
	*/

	cast(type) {
		return type({ type: "cast", value: this });
	}

	reinterpret() {
		return i32({ type: "reinterpret", value: this });
	}

	static get type() { return "f32"; }
}

export class Float64Type extends NumberType {
	/*
	load
	store
	eq
	ne
	lt
	gt
	le
	ge
	abs
	neg
	ceil
	floor
	trunc
	nearest
	sqrt
	add
	sub
	mul
	div
	min
	max
	copysign
	*/

	cast(type) {
		return type({ type: "cast", value: this });
	}

	reinterpret() {
		return i64({ type: "reinterpret", value: this });
	}

	static get type() { return "f64"; }
}

// Helper functions for short syntax
export function u32(...args) { return new UnsignedInt32Type(... args); }
u32.base = UnsignedInt32Type;

export function s32(...args) { return new SignedInt32Type(... args); }
s32.base = SignedInt32Type;

export function u64(...args) { return new UnsignedInt64Type(... args); }
u64.base = UnsignedInt64Type;

export function s64(...args) { return new SignedInt64Type(... args); }
s64.base = SignedInt64Type;

export function f32(...args) { return new Float32Type(... args); }
f32.base = Float32Type;

export function f64(...args) { return new Float64Type(... args); }
f64.base = Float64Type;
