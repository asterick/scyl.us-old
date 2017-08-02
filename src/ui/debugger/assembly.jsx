import Inferno from 'inferno';
import Component from 'inferno-component';
import style from "./style.css";

import { hex } from "../../util";

import locate from "../../system/mips/instructions";

export default class extends Component {
	disassemble(pc) {
		try {
			const word = this.props.runtime.readSafe(pc);
			const op = locate(word);
			const asm = op.instruction.assembly;

			op.pc = pc;

			// Generate assembly string
			const code = asm(op, pc);

			return <tr><td>{hex(pc)}</td> <td>{hex(word)}</td> {code}</tr>;
		} catch(E) {
			return <tr><td>{hex(pc)}</td> <td colSpan="3">Bus error</td></tr>;
		}
	}

	listing() {
		var lines = [];

		for (var i = 0; i < 140; i += 4) {
			lines.push(this.disassemble(this.props.runtime.pc + i));
		}

		return lines;
	}

	render() {
		return  <table class={style["disassembler"]}>{this.listing()}</table>
	}
};
