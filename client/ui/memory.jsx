import Inferno from 'inferno';
import Component from 'inferno-component';

import { load } from "../system";
import Registers from "../system/registers";

export default class extends Component {
	disassemble(pc) {
		try {
			const word = load(pc) >>> 0;
			return <tr><td className="number">{pc.toString(16)}</td> <td className="number">{word.toString(16)}</td></tr>;
		} catch(E) {
			return <tr><td className="number">{pc.toString(16)}</td> <td colSpan="3">Bus error</td></tr>;
		}
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 140; i += 4) {
			lines.push(this.disassemble(0xE0020000 + i));
		}

		return lines;
	}

	render() {
		return  <table class="memory">{this.listing()}</table>;
	}
};
