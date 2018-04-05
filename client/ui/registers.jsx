import Inferno from 'inferno';
import Component from 'inferno-component';

import { get_registers } from "../system";

export default class extends Component {
	render() {
		return <table class="registers">
			{ get_registers().map(n => <tr><td>{n.name}</td> <td className="number">{n.value.toString(16)}</td></tr>) }
		</table>;
	}
};
