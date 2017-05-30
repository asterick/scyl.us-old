export function load(url) {
	return new Promise(function (done, error) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);

		xhr.responseType = "arraybuffer";
		xhr.send();

		xhr.onreadystatechange = function () {
			if (xhr.readyState !== XMLHttpRequest.DONE) {
				return ;
			}

			if (xhr.status !== 200) {
				error(xhr.status, xhr.statusText);
				return ;
			}

			done(xhr.response);
		}

		xhr.onerror = function () {
			console.log(arguments);
		}
	})
}

export function params(funct) {
	return /\((.*)\)/g.exec(funct.toString())[1].split(/\s*,\s*/g);
}

export function hex(v = 0) {
	v = v.toString(16);
	return "00000000".substr(v.length) + v;
}

export function range(start, end, step) {
	if (end === undefined) {
		end = start;
		start = 0;
	}

	if (step === undefined) {
		step = (start < end) ? 1 : -1;
	}

	const lines = [];

	if (step > 0) {
		while (start < end) {
			lines.push(start);
			start += step;
		}
	} else {
		while (start > end) {
			lines.push(start);
			start += step;
		}
	}

	return lines;
}
