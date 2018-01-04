import Inferno from 'inferno';
import Component from 'inferno-component';

import Memory from "./memory";
import Assembly from "./assembly";
import Registers from "./registers";

import { running, start, stop, step } from "../system";

export default class extends Component {
	render() {
		return <div class="debugger">
			<div style="display: inline-block">
				{ running
					? <input type="button" value="stop" onClick={() => {
						stop();
						this.forceUpdate();
					}}/>
					: <input type="button" value="start" onClick={() => {
						start();
						this.forceUpdate();
					}}/>
				}
				<input type="button" value="step" onClick={() => {
					step();
					this.forceUpdate();
				}}/>
			</div>

			<Memory runtime={this.props.runtime} />
			<Assembly runtime={this.props.runtime} />
			<Registers runtime={this.props.runtime} />
		</div>;
	}
}
