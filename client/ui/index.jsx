import Inferno from 'inferno';
import Component from 'inferno-component';

import Memory from "./memory";
import Assembly from "./assembly";
import Registers from "./registers";

import { running, start, stop, step_execute } from "../system";

export default class extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: props.auth.currentUser.get()
		}

		this.auth = props.auth;
		this.auth.currentUser.listen((user) => this.setState({ user }));
	}

	render() {
		return <div class="debugger">
			{
				this.state.user.isSignedIn() ?
					<button onClick={() => this.auth.signOut()}>Sign out</button> :
					<button onClick={() => this.auth.signIn()}>Sign in</button>
			}
			<div style="display: inline-block">
				<input type="button" value={running ? "stop" : "start"} onClick={() => {
						if (running) {
							stop();
						} else {
							start();
						}

						this.forceUpdate();
				}}/>
				<input type="button" value="step" onClick={() => {
					step_execute();
					this.forceUpdate();
				}}/>
			</div>

			<Memory runtime={this.props.runtime} />
			<Assembly runtime={this.props.runtime} />
			<Registers runtime={this.props.runtime} />
		</div>;
	}
}
