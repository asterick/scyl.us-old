import { ReadStream, WriteStream } from "./stream";
import { MAGIC_NUMBER, ByteCode, ReverseByteCode } from "./const";

const PAYLOAD_TYPES = {
	CUSTOM: 0,
	TYPE: 1,
	IMPORT: 2,
	FUNCTION: 3,
	TABLE: 4,
	MEMORY: 5,
	GLOBAL: 6,
	EXPORT: 7,
	START: 8,
	ELEMENT: 9,
	CODE: 10,
	DATA: 11
}

const VALUE_TYPES = {
	"i32": -0x01,
	"i64": -0x02,
	"f32": -0x03,
	"f64": -0x04,
	"anyfunc": -0x10,
	"func_type": -0x20,
	"null_block": -0x40,
};

const KIND_TYPES = {
	FUNCTION: 0,
	TABLE: 1,
	MEMORY: 2,
	GLOBAL: 3
}

const FLAG_RESIZABLE_LIMIT_PRESENT = 1;
const FLAG_GLOBAL_MUTABLE = 1;

/*************
 ** WASM decoder
 *************/

function decode_value_type(payload) {
	const type = payload.varint();
	switch (type) {
	case VALUE_TYPES.i32: return "i32";
	case VALUE_TYPES.i64: return "i64";
	case VALUE_TYPES.f32: return "f32";
	case VALUE_TYPES.f64: return "f64";
	case VALUE_TYPES.null_block: return "null_block";
	}

	throw new Error(`Illegal value_type ${type}`);
}

function decode_elem_type(payload) {
	const type = payload.varint();
	switch (type) {
	case VALUE_TYPES.anyfunc: return "anyfunc";
	}

	throw new Error(`Illegal elem_type ${type}`);
}

function decode_resizable_limits(payload) {
	const flags = payload.varuint();
	const initial = payload.varuint();
	const maximum = (flags & FLAG_RESIZABLE_LIMIT_PRESENT) ? payload.varuint() : null;

	return {
		type: "resizable_limits",
		initial, maximum
	};
}

function decode_table_type(payload) {
	return {
		type: "table_type",
		element_type: decode_elem_type(payload),
		limits: decode_resizable_limits(payload)
	};
}

function decode_memory_type(payload) {
	return {
		type: "memory_type",
		limits: decode_resizable_limits(payload)
	};
}

function decode_global_type(payload) {
	const content_type = decode_value_type(payload);
	const flags = payload.varuint();

	return {
		type: "global_type",
		mutable: Boolean(flags & FLAG_GLOBAL_MUTABLE),
		content_type
	}
}

function decode_block_type(payload) {
	const type = decode_value_type(payload);
	const body = decode_code_expr(payload);

	return { type: "block_type", type, body }
}

function decode_code_expr(payload) {
	var codes = [];
	var byte;

	for (;;) {
		byte = payload.uint8();

		if (byte === ByteCode.end) {
			break ;
		}

		if (ReverseByteCode[byte] === undefined) {
			throw new Error(`illegal byte-code ${byte.toString(16)}`);
		}

		switch (byte) {
		case ByteCode["block"]:
		case ByteCode["loop"]:
		case ByteCode["if"]:
			codes.push({ op: ReverseByteCode[byte], block: decode_block_type(payload) });
			break ;
		case ByteCode["br"]:
		case ByteCode["br_if"]:
			codes.push({ op: ReverseByteCode[byte], relative_depth: payload.varuint() });
			break ;

		case ByteCode["br_table"]:
			{
				const count = payload.varuint();
				const target_table = [];

				while (target_table.length < count) target_table.push(payload.varuint());
				const default_target = payload.varuint();
				codes.push({ op: ReverseByteCode[byte], target_table, default_target });
			}
			break ;

		case ByteCode["call"]:
			codes.push({ op: ReverseByteCode[byte], function_index: payload.varuint() });
			break ;
		case ByteCode["call_indirect"]:
			codes.push({ op: ReverseByteCode[byte], type_index: payload.varuint(), reserved: payload.varuint() });
			break ;

		case ByteCode["get_local"]:
		case ByteCode["set_local"]:
		case ByteCode["tee_local"]:
		case ByteCode["get_global"]:
		case ByteCode["set_global"]:
			codes.push({ op: ReverseByteCode[byte], index: payload.varuint() });
			break ;
		case ByteCode["current_memory"]:
		case ByteCode["grow_memory"]:
			codes.push({ op: ReverseByteCode[byte], memory: payload.varuint() });
			break ;
		case ByteCode["i64.const"]:
			console.warn("Potential truncation: 64-bit constant");
		case ByteCode["i32.const"]:
			codes.push({ op: ReverseByteCode[byte], value: payload.varint() });
			break ;
		case ByteCode["f32.const"]:
			codes.push({ op: ReverseByteCode[byte], value: payload.float32() });
			break ;
		case ByteCode["f64.const"]:
			codes.push({ op: ReverseByteCode[byte], value: payload.float64() });
			break ;
		case ByteCode["i32.load"]:
		case ByteCode["i32.load8_s"]:
		case ByteCode["i32.load8_u"]:
		case ByteCode["i32.load16_s"]:
		case ByteCode["i32.load16_u"]:
		case ByteCode["i32.store"]:
		case ByteCode["i32.store8"]:
		case ByteCode["i32.store16"]:
		case ByteCode["i64.load"]:
		case ByteCode["i64.load8_s"]:
		case ByteCode["i64.load8_u"]:
		case ByteCode["i64.load16_s"]:
		case ByteCode["i64.load16_u"]:
		case ByteCode["i64.load32_s"]:
		case ByteCode["i64.load32_u"]:
		case ByteCode["i64.store"]:
		case ByteCode["i64.store8"]:
		case ByteCode["i64.store16"]:
		case ByteCode["i64.store32"]:
		case ByteCode["f32.load"]:
		case ByteCode["f32.store"]:
		case ByteCode["f64.load"]:
		case ByteCode["f64.store"]:
			codes.push({ op: ReverseByteCode[byte], flags: payload.varuint(), offset: payload.varuint() });
			break ;
		default:
			codes.push({ op: ReverseByteCode[byte] });
			break ;
		}

	}

	return codes;
}

function decode_type_section(payload) {
	const count = payload.varuint();
	const definitions = [];

	while (definitions.length < count) {
		const form = payload.varint();

		const param_count = payload.varuint();
		const parameters = [];

		while (parameters.length < param_count) parameters.push(decode_value_type(payload));

		const return_count = payload.varuint();
		const returns = [];

		while (returns.length < return_count) returns.push(decode_value_type(payload));

		definitions.push({ type: "func_type", form, parameters, returns });
	}

	return definitions;
}

function decode_func_type(payload) {
	return { type: "func_type", index: payload.varuint() };
}

function decode_import_section(payload) {
	const count = payload.varuint();
	const imports = [];

	while (imports.length < count) {
		const module = payload.string();
		const field = payload.string();
		const kind = payload.uint8();

		switch (kind) {
			case KIND_TYPES.FUNCTION:
				imports.push({ module, field, type: decode_func_type(payload) });
				break ;
			case KIND_TYPES.TABLE:
				imports.push({ module, field, type: decode_table_type(payload) });
				break ;
			case KIND_TYPES.MEMORY:
				imports.push({ module, field, type: decode_memory_type(payload) });
				break ;
			case KIND_TYPES.GLOBAL:
				imports.push({ module, field, type: decode_global_type(payload) });
				break ;
			default:
				throw new Error("illegal external_kind ${kind}");

		}
	}

	return imports;
}

function decode_function_section(payload) {
	const count = payload.varuint();
	const functions = [];

	while (functions.length < count) {
		functions.push(payload.varuint());
	}

	return functions;
}

function decode_table_section(payload) {
	const count = payload.varuint();
	const tables = [];

	while (tables.length < count) {
		tables.push(decode_table_type(payload));
	}

	return tables;
}

function decode_memory_section(payload) {
	const count = payload.varuint();
	const memories = [];

	while (memories.length < count) {
		memories.push(decode_memory_type(payload));
	}

	return memories;
}

function decode_global_section(payload) {
	const count = payload.varuint();
	const globals = [];

	while (globals.length < count) {
		const type = decode_global_type(payload);
		const init = decode_code_expr(payload);

		globals.push({ type, init });
	}

	return globals;
}

function decode_export_section(payload) {
	const count = payload.varuint();
	const exports = [];

	while (exports.length < count) {
		var field = payload.string();
		var kind = payload.varuint();

		switch (kind) {
			case KIND_TYPES.FUNCTION:
				kind = "func_type";
				break ;
			case KIND_TYPES.TABLE:
				kind = "table_type";
				break ;
			case KIND_TYPES.MEMORY:
				kind = "memory_type";
				break ;
			case KIND_TYPES.GLOBAL:
				kind = "global_type";
				break ;
			default:
				throw new Error(`illegal external_kind ${kind}`);
		}

		exports.push({ field, kind, index: payload.varuint() });
	}

	return exports;
}

function decode_start_section(payload) {
	return payload.varuint();
}

function decode_element_section(payload) {
	const count = payload.varuint();
	const segments = [];

	while (segments.length < count) {
		const index  = payload.varuint();
		const offset = decode_code_expr(payload);
		const element_count = payload.varuint();
		const elements = [];

		while (elements.length < element_count) {
			elements.push(payload.varuint());
		}

		segments.push({ type: "element_segment", index, offset, elements });
	}

	return segments;
}

function decode_code_section(payload) {
	const count = payload.varuint();
	const bodies = [];

	while (bodies.length < count) {
		const buffer = payload.buffer(payload.varuint());
		const body = new ReadStream(buffer);
		const local_count = body.varuint();
		const locals = [];

		while (locals.length < local_count) {
			locals.push({ count: body.varuint(), type: decode_value_type(body) });
		}

		const code = decode_code_expr(body);

		bodies.push({ locals, code });
	}

	return bodies;
}

function decode_data_section(payload) {
	const count = payload.varuint();
	const segments = [];

	while (segments.length < count) {
		const index  = payload.varuint();
		const offset = decode_code_expr(payload);
		const data_length = payload.varuint();
		const data = payload.buffer(data_length);

		segments.push({ type: "data_segment", index, offset, data });
	}

	return segments;
}

const DECODE_TYPES = {
	[PAYLOAD_TYPES.TYPE]: { name: "type_section", decode: decode_type_section },
	[PAYLOAD_TYPES.IMPORT]: { name: "import_section", decode: decode_import_section },
	[PAYLOAD_TYPES.FUNCTION]: { name: "function_section", decode: decode_function_section },
	[PAYLOAD_TYPES.TABLE]: { name: "table_section", decode: decode_table_section },
	[PAYLOAD_TYPES.MEMORY]: { name: "memory_section", decode: decode_memory_section },
	[PAYLOAD_TYPES.GLOBAL]: { name: "global_section", decode: decode_global_section },
	[PAYLOAD_TYPES.EXPORT]: { name: "export_section", decode: decode_export_section },
	[PAYLOAD_TYPES.START]: { name: "start_section", decode: decode_start_section },
	[PAYLOAD_TYPES.ELEMENT]: { name: "element_section", decode: decode_element_section },
	[PAYLOAD_TYPES.CODE]: { name: "code_section", decode: decode_code_section },
	[PAYLOAD_TYPES.DATA]: { name: "data_section", decode: decode_data_section }
};

export function decode (array) {
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
		const decoder = DECODE_TYPES[id];

		if (decoder) {
			result[decoder.name] = decoder.decode(payload);
		} else if (id != PAYLOAD_TYPES.CUSTOM) {
			throw new Error(`unsupported section type ${id}`);
		} else {
			result.custom.push({ name, data: payload.buffer() });
		}

		if (payload.remaining() > 0) {
			throw new Error(`section ${id} decoded with ${payload.remaining()} bytes remaining`)
		}
	}

	return result;
}

/************
 ** WASM encoder
 ************/

function encode_value_type(payload, type) {
	switch (type) {
	case "i32": payload.varint(VALUE_TYPES.i32); break ;
	case "i64": payload.varint(VALUE_TYPES.i64); break ;
	case "f32": payload.varint(VALUE_TYPES.f32); break ;
	case "f64": payload.varint(VALUE_TYPES.f64); break ;
	case "null_block": payload.varint(VALUE_TYPES.null_block); break ;
	default: throw new Error(`Illegal value_type ${type}`);
	}
}

function encode_kind_type(payload, type) {
	switch (type) {
	case "func_type":
		payload.uint8(KIND_TYPES.FUNCTION);
		break ;
	case "table_type":
		payload.uint8(KIND_TYPES.TABLE);
		break ;
	case "memory_type":
		payload.uint8(KIND_TYPES.MEMORY);
		break ;
	case "global_type":
		payload.uint8(KIND_TYPES.GLOBAL);
		break ;
	default:
		throw new Error("illegal external_kind ${def.type.type}");
	}
}

function encode_elem_type(payload, ast) {
	switch (ast) {
	case "anyfunc": payload.varint(VALUE_TYPES.anyfunc); break ;
	default: throw new Error(`Illegal elem_type ${type}`);
	}
}

function encode_resizable_limits(payload, ast) {
	const flags = (ast.maximum !== null) ? FLAG_RESIZABLE_LIMIT_PRESENT : 0;

	payload.varuint(flags);
	payload.varuint(ast.initial);

	if (flags & FLAG_RESIZABLE_LIMIT_PRESENT) {
		payload.varuint(ast.maximum);
	}
}

function encode_func_type(payload, ast) {
	payload.varuint(ast.index);
}

function encode_table_type(payload, ast) {
	encode_elem_type(payload, ast.element_type);
	encode_resizable_limits(payload, ast.limits);
}

function encode_memory_type(payload, ast) {
	encode_resizable_limits(payload, ast.limits);
}

function encode_global_type(payload, ast) {
	const flags =
		ast.mutable ? FLAG_GLOBAL_MUTABLE : 0;

	encode_value_type(payload, ast.content_type);
	payload.varuint(flags);
}

function encode_block_type(payload, ast) {
	encode_value_type(payload, ast.type);
	encode_code_expr(payload, ast.body);
}

function encode_code_expr(payload, codes) {
	codes.forEach(code => {
		const op = code.op;

		if (ByteCode[op] === undefined) {
			throw new Error(`illegal byte-code ${byte.toString(16)}`);
		}

		payload.uint8(ByteCode[op]);

		switch (op) {
		case "block":
		case "loop":
		case "if":
			encode_block_type(payload, code.block);
			break ;
		case "br":
		case "br_if":
			payload.varuint(code.relative_depth);
			break ;

		case "br_table":
			payload.varuint(code.target_table.length);
			code.target_table.forEach((v) => payload.varuint(v));
			payload.varuint(code.default_target);
			break ;

		case "call":
		payload.varuint(code.function_index)
			break ;
		case "call_indirect":
			payload.varuint(code.type_index)
			payload.varuint(code.reserved);
			break ;

		case "get_local":
		case "set_local":
		case "tee_local":
		case "get_global":
		case "set_global":
			payload.varuint(code.index);
			break ;
		case "current_memory":
		case "grow_memory":
			payload.varuint(code.memory);
			break ;
		case "i64.const":
			console.warn("Potential truncation: 64-bit constant");
		case "i32.const":
			payload.varint(code.value);
			break ;
		case "f32.const":
			payload.float32(code.value);
			break ;
		case "f64.const":
			payload.float64(code.value);
			break ;
		case "i32.load":
		case "i32.load8_s":
		case "i32.load8_u":
		case "i32.load16_s":
		case "i32.load16_u":
		case "i32.store":
		case "i32.store8":
		case "i32.store16":
		case "i64.load":
		case "i64.load8_s":
		case "i64.load8_u":
		case "i64.load16_s":
		case "i64.load16_u":
		case "i64.load32_s":
		case "i64.load32_u":
		case "i64.store":
		case "i64.store8":
		case "i64.store16":
		case "i64.store32":
		case "f32.load":
		case "f32.store":
		case "f64.load":
		case "f64.store":
			payload.varuint(code.flags);
			payload.varuint(code.offset);
			break ;
		}
	});

	payload.uint8(ByteCode.end);
}

function encode_type_section(defs) {
	const payload = new WriteStream();

	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.varint(def.form);
		payload.varuint(def.parameters.length);

		def.parameters.forEach((param) => encode_value_type(payload, param));

		payload.varuint(def.returns.length);
		def.returns.forEach(ret => encode_value_type(payload, ret));
	});

	return payload.result();
}

function encode_import_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.string(def.module);
		payload.string(def.field);
		encode_kind_type(payload, def.type.type);

		switch (def.type.type) {
		case "func_type":
			encode_func_type(payload, def.type);
			break ;
		case "table_type":
			encode_table_type(payload, def.type);
			break ;
		case "memory_type":
			encode_memory_type(payload, def.type);
			break ;
		case "global_type":
			encode_global_type(payload, def.type);
			break ;
		default:
			throw new Error("illegal external_kind ${def.type.type}");
		}
	});

	return payload.result();
}

function encode_function_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.varuint(def);
	});

	return payload.result();
}

function encode_table_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		encode_table_type(payload, def);
	});

	return payload.result();
}

function encode_memory_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		encode_memory_type(payload, def);
	});

	return payload.result();
}

function encode_global_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		encode_global_type(payload, def.type);
		encode_code_expr(payload, def.init);
	});

	return payload.result();
}

function encode_export_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.string(def.field);
		encode_kind_type(payload, def.kind);
		payload.varuint(def.index);
	});

	return payload.result();
}

function encode_start_section(body) {
	const payload = new WriteStream();
	payload.varuint(body);
	return payload.result();
}

function encode_element_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.varuint(def.index);
		encode_code_expr(payload, def.offset);
		payload.varuint(def.elements.length);
		def.elements.forEach((v) => payload.varuint(v));
	});

	return payload.result();
}

function encode_code_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		const body = new WriteStream();

		body.varuint(def.locals.length);
		def.locals.forEach(local => {
			body.varuint(local.count);
			encode_value_type(body, local.type);
		});
		encode_code_expr(body, def.code)

		const buffer = body.result();
		payload.varuint(buffer.byteLength);
		payload.buffer(buffer);
	});

	return payload.result();
}

function encode_data_section(defs) {
	const payload = new WriteStream();
	payload.varuint(defs.length);

	defs.forEach((def) => {
		payload.varuint(def.index);
		encode_code_expr(payload, def.offset);
		payload.varuint(def.data.byteLength);
		payload.buffer(def.data);
	});

	return payload.result();
}

const ENCODE_TYPES = [
	{ id: PAYLOAD_TYPES.TYPE, name: "type_section", encode: encode_type_section },
	{ id: PAYLOAD_TYPES.IMPORT, name: "import_section", encode: encode_import_section },
	{ id: PAYLOAD_TYPES.FUNCTION, name: "function_section", encode: encode_function_section },
	{ id: PAYLOAD_TYPES.TABLE, name: "table_section", encode: encode_table_section },
	{ id: PAYLOAD_TYPES.MEMORY, name: "memory_section", encode: encode_memory_section },
	{ id: PAYLOAD_TYPES.GLOBAL, name: "global_section", encode: encode_global_section },
	{ id: PAYLOAD_TYPES.EXPORT, name: "export_section", encode: encode_export_section },
	{ id: PAYLOAD_TYPES.START, name: "start_section", encode: encode_start_section },
	{ id: PAYLOAD_TYPES.ELEMENT, name: "element_section", encode: encode_element_section },
	{ id: PAYLOAD_TYPES.CODE, name: "code_section", encode: encode_code_section },
	{ id: PAYLOAD_TYPES.DATA, name: "data_section", encode: encode_data_section }
];

export function encode (ast) {
	const stream = new WriteStream();

	if (ast.magicNumber != MAGIC_NUMBER) {
		throw new Error("Invalid magic number");
	}

	if (ast.version != 1) {
		throw new Error(`Cannot encode wasm v${result.version} modules`);
	}

	stream.uint32(ast.magicNumber);
	stream.uint32(ast.version);

	ENCODE_TYPES.forEach((encoder) => {
		const def = ast[encoder.name];

		if (!def) return ;

		stream.varuint(encoder.id);
		const payload = encoder.encode(def);
		stream.varuint(payload.byteLength);
		stream.buffer(payload);
	});

	// Stuff in our custom blobs
	ast.custom.forEach((custom) => {
		const payload = new WriteStream();
		payload.string(custom.name);
		payload.buffer(custom.data);
		const data = payload.result();

		stream.varuint(PAYLOAD_TYPES.CUSTOM);
		stream.varuint(data.byteLength);
		stream.buffer(data);
	});

	return stream.result();
}
