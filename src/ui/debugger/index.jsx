import Inferno from 'inferno';
import Component from 'inferno-component';

import style from "./style.css";

import Memory from "./memory";
import Assembly from "./assembly";
import Registers from "./registers";

export default class extends Component {
	render() {
		return <div class={style.debugger}>
			<div style="display: inline-block">
				{ this.props.runtime.running
					? <input type="button" value="stop" onClick={() => {
						this.props.runtime.stop();
						this.forceUpdate();
					}}/>
					: <input type="button" value="start" onClick={() => {
						this.props.runtime.start();
						this.forceUpdate()
					}}/>
				}
				<input type="button" value="step" onClick={() => {
					this.props.runtime.step();
					this.forceUpdate();
				}}/>
			</div>

			<Memory runtime={this.props.runtime} />
			<Assembly runtime={this.props.runtime} />
			<Registers runtime={this.props.runtime} />
		</div>
	}
}
