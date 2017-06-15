import Binder from "./binder";
import FunctionType from "./function";

export default class ScopeType extends Binder {
	constructor (context) {
		super();

		this._context = context;
		this.mixin(context);

		this._body = [];
		this._ifBlock = false;

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
			if (this._localNamed[type] === undefined) {
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

	_locateScope(name) {
		var target = this;

		while (target._name !== name) {
			if (!(target instanceof ScopeType)) {
				throw new Error(`could not locate scope named ${name}`)
			}

			target = target._context;
			depth++;
		}

		return ;
	}

	name (n) {
		if (this._name) {
			throw new Error("cannot rename section ${this._name} to ${this._name}");
		}

		this._name = n;
	}

	// This is a cheap method of creating a target
	label(name) {
		const scope = new ScopeType(this);

		// Cleverly create a named section that contains all the code created thus far
		this._body.unshift( { type: "block", scope } );

		scope._body = this._body;
		scope.name(name);
		this._body = [];

		return this;
	}

	inline (call, ... args) {
		throw new Error("TODO");
	}

	return (... values) {
		this._body.push({ type: "return", values: values });
	}

	drop(expression = null) {
		this._body.push({ type: "drop", expression: expression });
	}

	nop() {
		this._body.push({ type: "nop" });
	}

	unreachable() {
		this._body.push({ type: "unreachable" });
	}

	table_break (selector, def, ... targets) {
		this._body.push({ type: "table_break", default: def, targets: elements })
	}

	break (name = null, condition = null) {
		if (typeof name !== "string") {
			condition = name;
			name = null;
		}

		this._body.push({
			type: "break", target: name || this, condition
		});
	}

	call (target, ... args) {
		throw new Error("TODO");
	}

	code (scope) {
		scope.call(this, this, ... this._args);

		return this;
	}

	emit (value) {
		this._body.push(value);

		return this;
	}

	block (context = null) {
		const scope = new ScopeType(this);

		this._body.push( { type: "block", scope } );

		if (context !== null) return this.code(context);

		return this;
	}

	loop (context = null) {
		const scope = new ScopeType(this);
		this._body.push( { type: "loop", scope } )

		if (context !== null) return this.code(context);

		return this;
	}

	if (condition, context = null) {
		const scope = new ScopeType(this, true);
		this._body.push( { type: "if", condition, scope } )

		if (context !== null) return this.code(context);

		return this;
	}

	else (context = null) {
		const previous = this._body[this._body.length - 1];

		if (previous && previous.type === 'if') {
			const scope = new ScopeType(this);
			previous.scope._body.push ({ type: "else", scope });

			if (context !== null) return scope.code(context);

			return this;
		} else if (this._context instanceof ScopeType) {
			return this._context.else(context);
		} else {
			throw new Error(`else outside of if block`);
		}

		return this;
	}
}

ScopeType.autoBind = ["local", "return", "inline", "name", "drop", "nop", "unreachable", "table_break", "break", "code", "block", "loop", "if", "else"];
