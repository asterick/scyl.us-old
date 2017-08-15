import Inferno from 'inferno';
import Component from 'inferno-component';

import style from "./style.css";

import Debugger from "./debugger";

export default class extends Component {
	componentWillUnmount() {
		this.props.runtime.attach(null);
	}

	render() {
		return <div>
			<canvas className={style.screen} ref={(node) => this.props.runtime.attach(node)} width="640" height="480" />
			<Debugger runtime={this.props.runtime} />
		</div>;
	}
}
