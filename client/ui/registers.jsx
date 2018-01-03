import Inferno from 'inferno';
import Component from 'inferno-component';

import { Registers as RegisterNames } from "../system/mips/consts";
import { hex } from "../util";
import { load, Registers } from "../system";

export default class extends Component {
	render() {
		return <table class="registers">
			<tr><td>pc</td> <td>{hex(Registers.pc)}</td></tr>
			<tr><td>hi</td> <td>{hex(Registers.hi)}</td></tr>
			<tr><td>lo</td> <td>{hex(Registers.lo)}</td></tr>
			{ RegisterNames.map((n, i) => <tr><td>{n}</td> <td>{hex(Registers.get(i))}</td></tr>) }
		</table>;
	}
};
