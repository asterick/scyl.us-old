export class NumberType {
	constructor (name = null) {
		// Constant number
		if (typeof name === "number") {
			return this.constructor.fromConst(name)
		}

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
		var num = new this();
		num._value = value;
		return num;
	}

	get type() {
		return this.constructor.type;
	}
}

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
function conv(base) {
	var f = function (name) { return new base(name); };
	f.const = function(value) { return base.fromConst(value); };
	f.type = base.type;
	return f;
}

export const i32 = conv(Int32Type);
export const i64 = conv(Int64Type);
export const f32 = conv(Float32Type);
export const f64 = conv(Float64Type);

console.log(i32(10).type)