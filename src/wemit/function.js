import { NumberType } from "./numbers";
import ScopeType from "./scope";

export default class FunctionType extends ScopeType {
	constructor (context, ... args) {
		super(context);

		this._module = context;

		this._name = null;
		this._returns = null;

		args.forEach((type) => {
			if (typeof type === "function") { type = type(); }
			type.bind(this);
			this._args.push(type);
		});
	}

	returns( ...types) {
		this._returns = types;
		return this;
	}

	export (name) {
		if (this._module._exports[name] !== undefined) {
			throw new Error("Export redefinition");
		}

		this._module._exports[name] = this;
		return this;
	}
}

FunctionType.autoBind = ["returns", "export"].concat(ScopeType.autoBind);
