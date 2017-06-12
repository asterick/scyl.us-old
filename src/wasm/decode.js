import { ReadStream, WriteStream } from "./stream";
import { MAGIC_NUMBER } from "./const";

function assert(test, type) {
	if (!test) {
		alert(type);
		throw new Error(type);
	}
}

const PAYLOAD_TYPES = {
	"CUSTON": 0,
	"TYPE": 1,
	"IMPORT": 2,
	"FUNCTION": 3,
	"TABLE": 4,		// ***
	"MEMORY": 5,	// ***
	"GLOBAL": 6,	// ***
	"EXPORT": 7,	// ***
	"START": 8,		// ***
	"ELEMENT": 9,	// ***
	"CODE": 10,		// ***
	"DATA": 11		// ***
}

const VALUE_TYPES = {
	"i32": -0x01,
	"i64": -0x02,
	"f32": -0x03,
	"f64": -0x04,
	"anyfunc": -0x10,
	"func": -0x20,
	"block_type": -0x40,
};

const KIND_TYPES = {
	FUNCTION: 0,
	TABLE: 1,
	MEMORY: 2,
	GLOBAL: 3
}

function value_type(payload) {
	const type = payload.varint();
	switch (type) {
	case VALUE_TYPES.i32: return "i32";
	case VALUE_TYPES.i64: return "i64";
	case VALUE_TYPES.f32: return "f32";
	case VALUE_TYPES.f64: return "f64";
	}

	throw new Error(`Illegal value_type ${type}`);
}

function external_kind(payload) {
	const type = payload.varuint();
	swit
}

function func_type(payload) {
	const form = payload.varint();
	
	const param_count = payload.varuint();
	const parameters = [];

	for (var i = 0; i < param_count; i++) parameters.push(value_type(payload));

	const return_count = payload.varuint();
	const returns = [];

	for (var i = 0; i < return_count; i++) returns.push(value_type(payload));

	return { type: "func_type", parameters, returns }
}

function elem_type(payload) {
	const type = payload.varint();
	switch (type) {
	case VALUE_TYPES.anyfunc: return "anyfunc";
	}

	throw new Error(`Illegal elem_type ${type}`);
}

function resizable_limits(payload) {
	const FLAG_PRESENT = 1;
	
	const flags = payload.varuint();
	const initial = payload.varuint();
	const maximum = (flags & FLAG_PRESENT) ? payload.varuint() : null;
	
	return {
		type: "resizable_limits",
		initial, maximum 
	};
}

function table_type(payload) {
	return { 
		type: "table_type", 
		element_type: elem_type(payload), 
		limits: resizable_limits(payload)
	};
}

function memory_type(payload) {
	return { 
		type: "memory_type", 
		limits: resizable_limits(payload)
	};
}

function global_type(payload) {
	const FLAGS_MUTABLE = 1;

	const content_type = value_type(payload);
	const flags = payload.varuint();

	return {
		type: "global_type",
		mutable: Boolean(flags & FLAGS_MUTABLE),
		content_type
	}
}

function import_entry(payload) {
	var module = payload.string();
	var field = payload.string();
	var kind = payload.uint8();
	
	switch (kind) {
		case KIND_TYPES.FUNCTION:
			return { module, field, type: { type: "func", index: payload.varuint() } };
		case KIND_TYPES.TABLE:
			return { module, field, type: table_type(payload) };
		case KIND_TYPES.MEMORY:
			return { module, field, type: memory_type(payload) };
		case KIND_TYPES.GLOBAL:
			return { module, field, type: global_type(payload) };
	}

	throw new Error("illegal external_kind ${kind}");
}

function export_type(payload) {
	var field = payload.string();
	var kind = payload.varuint();

	switch (kind) {
		case KIND_TYPES.FUNCTION:
			kind = "func";
			break ;
		case KIND_TYPES.TABLE:
			kind = "table";
			break ;
		case KIND_TYPES.MEMORY:
			kind = "memory";
			break ;
		case KIND_TYPES.GLOBAL:
			kind = "global";
			break ;
		default:
			throw new Error(`illegal external_kind ${kind}`);
	}

	return { field, kind, index: payload.varuint() }
}

function local_entry(payload) {
	const count = payload.varuint();
	const type = value_type(payload);

	return { count, type }
}

function code_body(payload) {
	return new Uint8Array(payload.buffer());
}

function function_body(payload) {
	const body_size = payload.varuint();
	const body = new ReadStream(payload.buffer(body_size));
	const local_count = body.varuint();
	const locals = [];

	for (var i = 0; i < local_count; i++) {
		locals.push(local_entry(body));
	}

	const code = code_body(body);

	return { locals, code }
}

function data_segment(payload) {
}

// Sections
function type_section(payload) {
	const count = payload.varuint();
	const definitions = [];

	for (var i = 0; i < count; i++) {
		definitions.push(func_type(payload));
	}

	return { type: "type_section", definitions };
}

function import_section(payload) {
	const count = payload.varuint();
	const imports = [];

	for (var i = 0; i < count; i++) {
		imports.push(import_entry(payload));
	}

	return { type: "import_section", imports };
}

function function_section(payload) {
	const count = payload.varuint();
	const functions = [];

	for (var i = 0; i < count; i++) {
		functions.push(payload.varuint());
	}

	return { type: "function_section", functions };
}

function table_section(payload) {
	const count = payload.varuint();
	const tables = [];

	for (var i = 0; i < count; i++) {
		tables.push(table_type(payload));
	}

	return { type: "table_section", tables };
}

function memory_section(payload) {
	const count = payload.varuint();
	const memories = [];

	for (var i = 0; i < count; i++) {
		memories.push(memory_type(payload));
	}

	return { type: "memory_section", memories };
}

// GLOBALS

function export_section(payload) {
	const count = payload.varuint();
	const exports = [];

	for (var i = 0; i < count; i++) {
		exports.push(export_type(payload));
	}

	return { type: "export_section", exports };
}

// START
// ELEMENT

function code_section(payload) {
	const count = payload.varuint();
	const bodies = [];

	for (var i = 0; i < count; i++) {
		bodies.push(function_body(payload));
	}

	return { type: "code_section", bodies };
}

function data_section(payload) {
	const count = payload.varuint();
	const segments = [];

	for (var i = 0; i < count; i++) {
		segments.push(data_segment(payload));
	}

	return { type: "data_section", segments };
}

const DECODE_TYPES = {
	[PAYLOAD_TYPES.TYPE]: type_section,
	[PAYLOAD_TYPES.IMPORT]: import_section,			// ???
	[PAYLOAD_TYPES.FUNCTION]: function_section,
	[PAYLOAD_TYPES.TABLE]: table_section,
	[PAYLOAD_TYPES.MEMORY]: memory_section,
	[PAYLOAD_TYPES.GLOBAL]: null,					// ???
	[PAYLOAD_TYPES.EXPORT]: export_section,
	[PAYLOAD_TYPES.START]: null,					// ???
	[PAYLOAD_TYPES.ELEMENT]: null,					// ???
	[PAYLOAD_TYPES.CODE]: code_section,
	[PAYLOAD_TYPES.DATA]: data_section
};

export default function (array) {
	const stream = new ReadStream(array);
	const result = {
		magicNumber: stream.uint32(),
		version: stream.uint32(),
		payload: []
	};

	if (result.magicNumber != MAGIC_NUMBER) {
		throw new Error("Attempted to decode something that was not a wasm module");
	}

	if (result.version != 1) {
		throw new Error(`Cannot decode wasm v${result.version} modules`);
	}

	while (!stream.eof()) {
		var id = stream.varuint();
		var payloadLength = stream.varuint();
		var payload = new ReadStream(stream.buffer(payloadLength));
		var name = id == PAYLOAD_TYPES.CUSTOM ? payload.string() : null;

		result.payload.push({
			id: id || name,
			data: DECODE_TYPES[id] ? DECODE_TYPES[id](payload) : payload.buffer()
		});
	}

	return result;
}
