import Inferno from 'inferno';
import Component from 'inferno-component';

import { Registers as RegisterNames } from "../system/mips/consts";
import { hex } from "../util";
import { load, registers } from "../system";

export default class extends Component {
	render() {
		return <table class="registers">
			{ RegisterNames.map((n, i) => <tr><td>{n}</td> <td>{hex(registers[i])}</td></tr>) }
		</table>;
	}
};
