import { NumberType } from "./numbers";
import ScopeType from "./scope";

export default class FunctionType {
	constructor(context, ... args) {
		this._module = context;

		this._name = null;
		this._scope = new ScopeType(this);
		this._args = args.map((v) => {
			if (typeof v === "function") { v = v(); }
			v.bind(this._module, this, this._scope);
			return v;
		});

		this._returns = null;

		// Bound functions for scope magic
		this.local = this.local.bind(this);

		// Bind to scope
		this.if = this._scope.if;
		this.loop = this._scope.loop;
		this.block = this._scope.block;
		this.code = this._scope.code;

		// Bind to module
		this.function = this._module.function;
		this.global = this._module.global;
		this.compile = this._module.compile;
	}

	returns(...types) {
		this._returns = types;
		return this;
	}

	export(name) {
		this._name = name;
		return this;
	}

	local(type) {
		return new type(this._module, this);
	}
}
