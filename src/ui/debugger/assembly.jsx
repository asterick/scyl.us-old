import Inferno from 'inferno';
import Component from 'inferno-component';
import style from "./style.css";

import { hex, range } from "../../util";

export default class Assembly extends Component {
	render() {
		return  <table class={style["disassembler"]}>{range(34).map((i) => {
			const address = this.props.runtime.pc + i * 4;
			try {
				var inst = this.props.runtime.disassemble(address);
				if (inst.code) {
					const code = inst.code.split("\t");

					return <tr><td>{hex(address)}</td> <td>{hex(inst.word)}</td> <td>{code[0]}</td> <td>{code[1]}</td></tr>;
				} else {
					return <tr><td>{hex(address)}</td> <td>{hex(inst.word)}</td> <td colSpan="2">Illegal Instruction</td></tr>;
				}
			} catch (e) {
				return <tr><td>{hex(address)}</td> <td colSpan="3">Bus error</td></tr>;
			}
		})}
		</table>
	}
};
