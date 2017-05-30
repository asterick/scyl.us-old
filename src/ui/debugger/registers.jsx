import Inferno from 'inferno';
import Component from 'inferno-component';

import style from "./style.css";

import { Registers } from "../../system/mips/consts";
import { hex, range } from "../../util";

export default class RegistersView extends Component {
	render() {
		return <table class={style.registers}>
			<tr><td>pc</td> <td>{hex(this.props.runtime.pc)}</td></tr>
			<tr><td>hi</td> <td>{hex(this.props.runtime.hi)}</td></tr>
			<tr><td>lo</td> <td>{hex(this.props.runtime.lo)}</td></tr>
			{ range(1, 32).map((i) => <tr><td>{Registers[i]}</td> <td>{hex(this.props.runtime.registers[i])}</td></tr>) }
		</table>
	}
};
