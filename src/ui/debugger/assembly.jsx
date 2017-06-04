import Inferno from 'inferno';
import Component from 'inferno-component';
import style from "./style.css";

import { hex } from "../../util";

import locate from "../../system/mips/instructions";

export default class extends Component {
	disassemble(pc) {
		const word = this.props.runtime.readSafe(pc);
		const op = locate(word);
		const asm = op.instruction.assembly;

		if (!asm.fields) {
			asm.fields = /\((.*?)\)/g.exec(asm.toString())[1].split(/\s*,\s*/g);
		}

		op.pc = pc;

		// Generate assembly string
		const code = asm(...asm.fields.map((f) => op[f]))
			.split("\t")
			.map((v) => <td>{v}</td>);

		return <tr><td>{hex(pc)}</td> <td>{hex(word)}</td> {code}</tr>;
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 35; i++) {
			const address = this.props.runtime.pc + i * 4;

			try {
				lines.push(this.disassemble(address));
			} catch (e) {
				lines.push(<tr><td>{hex(address)}</td> <td colSpan="3">Bus error</td></tr>);
			}
		}

		return lines;
	}

	render() {
		return  <table class={style["disassembler"]}>{this.listing()}</table>
	}
};
