import Inferno from 'inferno';
import Component from 'inferno-component';

import { hex } from "../util";

import { load } from "../system";
import Registers from "../system/mips/registers";

export default class extends Component {
	disassemble(pc) {
		try {
			const word = load(pc) >>> 0;
			return <tr><td>{hex(pc)}</td> <td>{hex(word)}</td></tr>;
		} catch(E) {
			return <tr><td>{hex(pc)}</td> <td colSpan="3">Bus error</td></tr>;
		}
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 140; i += 4) {
			lines.push(this.disassemble(0x80020000 + i));
		}

		return lines;
	}

	render() {
		return  <table class="memory">{this.listing()}</table>;
	}
};
