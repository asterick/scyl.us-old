import { ReadStream, WriteStream } from "./stream";
import { MAGIC_NUMBER, ByteCode } from "./const";

const PAYLOAD_TYPES = {
	"CUSTOM": 0,
	"TYPE": 1,
	"IMPORT": 2,
	"FUNCTION": 3,
	"TABLE": 4,
	"MEMORY": 5,
	"GLOBAL": 6,
	"EXPORT": 7,
	"START": 8,
	"ELEMENT": 9,
	"CODE": 10,
	"DATA": 11
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

/*********
 ** Byte-Code
 *************/

function code_expr(payload) {
	// TODO: THIS SHOULD DECOMPOSE CODE
	var bytes = [];
	var byte;
	do {
		bytes.push(byte = payload.uint8());
	} while (byte != ByteCode.end);
	return bytes;
}


/*********
 ** Sections
 *************/

function type_section(payload) {
	const count = payload.varuint();
	const definitions = [];

	while (definitions.length < count) {
		const form = payload.varint();

		const param_count = payload.varuint();
		const parameters = [];

		while (parameters.length < param_count) parameters.push(value_type(payload));

		const return_count = payload.varuint();
		const returns = [];

		while (returns.length < return_count) returns.push(value_type(payload));

		definitions.push({ type: "func_type", parameters, returns });
	}

	return { type: "type_section", body: definitions };
}

function import_section(payload) {
	const count = payload.varuint();
	const imports = [];

	while (imports.length < count) {
		const module = payload.string();
		const field = payload.string();
		const kind = payload.uint8();

		switch (kind) {
			case KIND_TYPES.FUNCTION:
				imports.push({ module, field, type: { type: "func", index: payload.varuint() } });
				break ;
			case KIND_TYPES.TABLE:
				imports.push({ module, field, type: table_type(payload) });
				break ;
			case KIND_TYPES.MEMORY:
				imports.push({ module, field, type: memory_type(payload) });
				break ;
			case KIND_TYPES.GLOBAL:
				imports.push({ module, field, type: global_type(payload) });
				break ;
			default:
				throw new Error("illegal external_kind ${kind}");

		}
	}

	return { type: "import_section", body: imports };
}

function function_section(payload) {
	const count = payload.varuint();
	const functions = [];

	while (functions.length < count) {
		functions.push(payload.varuint());
	}

	return { type: "function_section", body: functions };
}

function table_section(payload) {
	const count = payload.varuint();
	const tables = [];

	while (tables.length < count) {
		tables.push(table_type(payload));
	}

	return { type: "table_section", body: tables };
}

function memory_section(payload) {
	const count = payload.varuint();
	const memories = [];

	while (memories.length < count) {
		memories.push(memory_type(payload));
	}

	return { type: "memory_section", body: memories };
}

function global_section(payload) {
	const count = payload.varuint();
	const globals = [];

	while (globals.length < count) {
		const type = global_type(payload);
		const init = code_expr(payload);

		globals.push({ type, init });
	}

	return { type: "global_section", body: globals };
}

function export_section(payload) {
	const count = payload.varuint();
	const exports = [];

	while (exports.length < count) {
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

		exports.push({ field, kind, index: payload.varuint() });
	}

	return { type: "export_section", body: exports };
}

function start_section(payload) {
	return { type: "start_section", body: payload.varuint() };
}

function element_section(payload) {
	const count = payload.varuint();
	const segments = [];

	while (segments.length < count) {
		const index  = payload.varuint();
		const offset = code_expr(payload);
		const element_count = payload.varuint();
		const elements = [];

		while (elements.length < element_count) {
			elements.push(payload.varuint());
		}

		segments.push({ type: "element_segment", index, offset, elements });
	}

	return { type: "element_section", body: segments }
}

function code_section(payload) {
	const count = payload.varuint();
	const bodies = [];

	while (bodies.length < count) {
		const body_size = payload.varuint();
		const body = new ReadStream(payload.buffer(body_size));
		const local_count = body.varuint();
		const locals = [];

		while (locals.length < local_count) {
			const count = body.varuint();
			const type = value_type(body);

			for (var i = 0; i < count; i++) locals.push(type);
		}

		const code = code_expr(body);

		bodies.push({ locals, code });
	}

	return { type: "code_section", body: bodies };
}

function data_section(payload) {
	const count = payload.varuint();
	const segments = [];

	while (segments.length < count) {
		const index  = payload.varuint();
		const offset = code_expr(payload);
		const data_length = payload.varuint();
		const data = new Uint8Array(payload.buffer(data_length));

		segments.push({ type: "data_segment", index, offset, data });
	}

	return { type: "data_section", body: segments };
}

const DECODE_TYPES = {
	[PAYLOAD_TYPES.TYPE]: type_section,
	[PAYLOAD_TYPES.IMPORT]: import_section,
	[PAYLOAD_TYPES.FUNCTION]: function_section,
	[PAYLOAD_TYPES.TABLE]: table_section,
	[PAYLOAD_TYPES.MEMORY]: memory_section,
	[PAYLOAD_TYPES.GLOBAL]: global_section,
	[PAYLOAD_TYPES.EXPORT]: export_section,
	[PAYLOAD_TYPES.START]: start_section,
	[PAYLOAD_TYPES.ELEMENT]: element_section,
	[PAYLOAD_TYPES.CODE]: code_section,
	[PAYLOAD_TYPES.DATA]: data_section
};

export default function (array) {
	const stream = new ReadStream(array);
	const result = {
		magicNumber: stream.uint32(),
		version: stream.uint32(),
		custom: []
	};

	if (result.magicNumber != MAGIC_NUMBER) {
		throw new Error("Attempted to decode something that was not a wasm module");
	}

	if (result.version != 1) {
		throw new Error(`Cannot decode wasm v${result.version} modules`);
	}

	while (!stream.eof()) {
		const id = stream.varuint();
		const payloadLength = stream.varuint();
		const payload = new ReadStream(stream.buffer(payloadLength));
		const name = id == PAYLOAD_TYPES.CUSTOM ? payload.string() : null;

		if (DECODE_TYPES[id]) {
			const decoded = DECODE_TYPES[id](payload);
			result[decoded.type] = decoded.body;
		} else if (id != PAYLOAD_TYPES.CUSTOM) {
			throw new Error(`unsupported section type ${id}`);
		} else {
			result.custom.push({ name, data: payload.buffer() });
		}

		console.log(payload.remaining())
	}

	return result;
}
