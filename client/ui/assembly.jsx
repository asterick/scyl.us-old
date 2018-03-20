import Inferno from 'inferno';
import Component from 'inferno-component';

import { disassemble } from "../system/instructions";

import { load } from "../system";
import Registers from "../system/registers";

export default class extends Component {
	disassemble(pc) {
		try {
			const word = load(pc) >>> 0;
			return <tr>
				<td className="number">{pc.toString(16)}</td> 
				<td className="number">{word.toString(16)}</td> 
				{ disassemble(word, pc) }
			</tr>;
		} catch(e) {
			return <tr><td className="number">{pc.toString(16)}</td> <td colSpan="3">Bus error</td></tr>;
		}
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 140; i += 4) {
			lines.push(this.disassemble(Registers.pc + i));
		}

		return lines;
	}

	render() {
		return  <table class="disassembler">{this.listing()}</table>;
	}
};
