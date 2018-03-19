#!/usr/bin/env node
const argv = require('optimist').argv;
const fs = require('fs');

const decode = require('../dynast/import.js');
const encode = require('../dynast/export.js');

function Decode(fn) {
	var buffer = fs.readFileSync(fn);
	var array = new Uint8Array(buffer.length);

	for (var i = 0; i < buffer.length; i++) array[i] = buffer[i];

	return decode(array.buffer);
}

argv._.forEach(obj => {
	const defs = Decode(obj);
	console.log(defs)
});

//console.log(argv);
