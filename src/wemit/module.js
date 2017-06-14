import Binder from "./binder";
import decode from "./primitive/import";
import encode from "./primitive/export";

import FunctionType from "./function";
import ScopeType from "./scope";

export default class ModuleType extends Binder {
	constructor(proto) {
		super();

		if (proto instanceof ArrayBuffer) {
			return ModuleType.fromArray(proto);
		}

		this._globals = [];
		this._exports = {};
		this._start = null;
	}

	compile () {
		throw new Error("TODO");
	}

	start () {
		if (this._start === null) {
			this._start = new ScopeType(this);
		}

		return this._start;
	}

	data () {
		throw new Error("TODO");
	}

	function (... rest) {
		return new FunctionType(this, ...rest);
	}

	global (type) {
		throw new Error("Todo");
	}

	// Static members
	static fromArrayBuffer(array) {
		var ast = decode(array)

		throw new Error("TODO");
	}
}

ModuleType.autoBind = ["compile", "start", "data", "function", "global"];
