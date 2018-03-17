const fs = require("fs");

const all = process.argv
		.slice(2)
		.forEach(fn => {
			var data = fs.readFileSync(fn);

			for (var i = 0; i < data.length; i+= 4)
				console.log(`${data.readUInt32LE(i)}, `);
		});
