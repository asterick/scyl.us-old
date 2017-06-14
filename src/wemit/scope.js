import Binder from "./binder";
import FunctionType from "./function";

export default class ScopeType extends Binder {
	constructor (context, ifBlock = false) {
		super();

		this._context = context;
		this.mixin(context);

		this._body = [];

		if (context instanceof ScopeType) {
			this._locals = context._locals;
			this._localNamed = Object.create(context._localNamed);
			this._args = context._args;
		} else {
			this._localNamed = {};
			this._locals = [];
			this._args = [];
		}
	}

	local (type) {
		if (typeof type === "string") {
			if (this._localNamed[type]) {
				throw new Error(`No local named ${type}`);
			}

			return this._localNamed[type];
		} else if (typeof type === 'function') {
			type = new type();
		} else {
			const name = type._name;

			if (name !== null) {
				if (this._localNamed[name]) {
					if (!type.same(this._localNamed[name])) {
						throw new Error(`Local redefintion of ${name} from ${this._localNamed[name].type} to ${type.type}`);
					}

					return this._localNamed[name];
				} else {
					this._localNamed[name] = type;
				}
			}
		}

		type.bind(this);
		this._locals.push(type);

		return type;
	}

	code (scope) {
		scope.call(this, this, ... this._args);

		return this;
	}

	block (context = null) {
		const scope = new ScopeType(this);

		this._body.push( { type: "block", scope } );

		if (context !== null) return this.code(context);

		return scope;
	}

	loop (context = null) {
		const scope = new ScopeType(this);
		this._body.push( { type: "loop", scope } )

		if (context !== null) return this.code(context);

		return scope;
	}

	if (condition, context = null) {
		const scope = new ScopeType(this, true);
		this._body.push( { type: "if", condition, scope } )

		if (context !== null) return this.code(context);

		return scope;
	}

	else (context = null) {
		if (!this._ifBlock) throw new Error("else outside if block");
		this._body.push( { type: "else" } );
		this._ifBlock = false;

		if (context !== null) return this.code(context);

		return this;
	}
}

ScopeType.autoBind = ["local", "code", "block", "loop", "if", "else"];
