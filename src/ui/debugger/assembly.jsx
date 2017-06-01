import Inferno from 'inferno';
import Component from 'inferno-component';
import style from "./style.css";

import { hex } from "../../util";

export default class extends Component {
	disasm() {
		var lines = [];

		for (var i = 0; i < 35; i++) {
			const address = this.props.runtime.pc + i * 4;

			try {
				const inst = this.props.runtime.disassemble(address);
				const code = inst.code.split("\t");

				lines.push(<tr><td>{hex(address)}</td> <td>{hex(inst.word)}</td> <td>{code[0]}</td> <td>{code[1]}</td></tr>);
			} catch (e) {
				lines.push(<tr><td>{hex(address)}</td> <td colSpan="3">Bus error</td></tr>);
			}
		}

		return lines;
	}

	render() {
		return  <table class={style["disassembler"]}>{this.disasm()}</table>
	}
};
