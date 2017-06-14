export default class {
	constructor() {
		this.constructor.autoBind.forEach((v) => {
			this[v] = this[v].bind(this);
		});
	}

	mixin(... targets) {
		targets.forEach((target) => {
			Object.keys(target).forEach((v) => {
				if (typeof target[v] !== "function" || this[v] !== undefined) return ;
				this[v] = target[v];
			});
		});
	}
}