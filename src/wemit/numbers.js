export class NumberType {
	constructor (name = null) {
		this._name = name;
	}

	bind(module, funct, scope) {
		this._module = module;
		this._function = funct;
		this._scope = scope;

		// Bind to module
		this.function = this._module.function;
		this.global = this._module.global;
		this.compile = this._module.compile;

		if (funct) {
			// Bound functions for scope magic
			this.local = this._function.local;
		}

		if (scope) {
			// Bind to scope
			this.if = this._scope.if;
			this.loop = this._scope.loop;
			this.block = this._scope.block;
			this.code = this._scope.code;
		}
	}

	static fromConst(value) {
		this._value = value;
	}
}

export class Int32Type extends NumberType {
	get type() { return "i32"; }
}

export class Int64Type extends NumberType {
	get type() { return "i64"; }
}

export class Float32Type extends NumberType {
	get type() { return "f32"; }
}

export class Float64Type extends NumberType {
	get type() { return "f64"; }
}

// Helper functions for short syntax
export function i32(name) {
	if (typeof name === "number") return Int32Type.fromConst(value) ;

	return new Int32Type(name);
}
i32.const = function (value) { return Int32Type.fromConst(value) }

export function i64(name) {
	if (typeof name === "number") return Int32Type.fromConst(value) ;

	return new Int64Type(name);
}
i64.const = function (value) { return Int64Type.fromConst(value) }

export function f32(name) {
	if (typeof name === "number") return Int32Type.fromConst(value) ;

	return new Float32Type(name);
}
i64.const = function (value) { return Int64Type.fromConst(value) }

export function f64(name) {
	if (typeof name === "number") return Int32Type.fromConst(value) ;

	return new Float64Type(name);
}
i64.const = function (value) { return Int64Type.fromConst(value) }
