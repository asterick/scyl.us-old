#!/usr/bin/env node
const encode = require("../dynast/export.js");
const decode = require("../dynast/import.js");
const fs = require("fs");

var buffer = fs.readFileSync(process.argv[2]);
var array = new Uint8Array(buffer.length);

for (var i = 0; i < buffer.length; i++) array[i] = buffer[i];

var defs = decode(array.buffer);

defs.data_section = defs.data_section.filter(section => {
	var array = new Uint8Array(section.data);

	for (var i = array.length - 1; i >= 0 && !array[i]; i--) ;

	if (i < 0) return false;

	section.data = section.data.slice(0, i + 1);

	return true;
});

const reset = defs.export_section.filter(v => v.kind == 'func_type' && v.field == 'reset').pop();
if (reset) defs.start_section = reset.index;

fs.writeFileSync(process.argv[2], new Uint8Array(encode(defs)))
