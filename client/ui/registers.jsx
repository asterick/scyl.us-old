import Inferno from 'inferno';
import Component from 'inferno-component';

import { Registers as RegisterNames } from "../system/consts";
import { load, registers } from "../system";

export default class extends Component {
	render() {
		return <table class="registers">
			{ RegisterNames.map((n, i) => <tr><td>{n}</td> <td className="number">{registers[i].toString(16)}</td></tr>) }
		</table>;
	}
};
