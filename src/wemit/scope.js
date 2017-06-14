import Module from "./module";

export default class ScopeType {
	constructor(context) {
		this._function = context;
		this._module = this._function._module;
		this._body = [];

		// Bind magic
		this.code = this.code.bind(this);
		this.block = this.block.bind(this);
		this.if = this.if.bind(this);
		this.loop = this.loop.bind(this);

		// Module binds
		this.function = this._module.function;
		this.global = this._module.global;
		this.compile = this._module.compile;

		// Function binds
		this.local = this._function.local;
	}

	code (scope) {
		scope.call(this, this, ... this._function._args);
	}

	block () {
		const scope = new ScopeType(this._function);
		this._body.push( { type: "block", scope } )
		return scope;
	}

	if (condition) {
		const scope = new ScopeType(this._function);
		this._body.push( { type: "if", condition, scope } )
		return scope;
	}

	loop () {
		throw new Error("TODO");
	}
}
