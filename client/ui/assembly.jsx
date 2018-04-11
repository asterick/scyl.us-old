import Inferno from 'inferno';
import Component from 'inferno-component';

import { disassemble } from "../system/table";

import { load, get_pc } from "../system";

export default class extends Component {
	disassemble(pc) {
		try {
			const word = load(pc) >>> 0;
			return <tr>
				<td className="number">{pc.toString(16)}</td> 
				<td className="number">{word.toString(16)}</td> 
				<td>{ disassemble(word, pc) }</td>
			</tr>;
		} catch(e) {
			return <tr><td className="number">{pc.toString(16)}</td> <td colSpan="2">Bus error</td></tr>;
		}
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 128; i += 4) {
			lines.push(this.disassemble(get_pc() + i));
		}

		return lines;
	}

	render() {
		return  <table class="disassembler">{this.listing()}</table>;
	}
};
