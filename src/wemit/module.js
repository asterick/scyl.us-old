import decode from "./primitive/import";
import encode from "./primitive/export";

import Func from "./function";

export default class ModuleType {
	constructor(proto) {
		if (proto instanceof ArrayBuffer) {
			return ModuleType.fromArray(proto);
		}

		this._functions = [];
		this._globals = [];

		// Scope magic functions
		this.compile = this.compile.bind(this);
		this.function = this.function.bind(this);
		this.global = this.global.bind(this);
	}

	compile () {
		throw new Error("TODO");
	}

	function (... rest) {
		var f = new Func(this, ...rest);
		this._functions.push(f);
		return f;
	}

	global (type) {
		return new type(this, null);
	}

	// Static members
	static fromArrayBuffer(array) {
		var ast = decode(array)

		throw new Error("TODO");
	}
}
