const { WriteStream } = require("./stream");
const {
	MAGIC_NUMBER,
	PAYLOAD_TYPES, VALUE_TYPES, KIND_TYPES,
	FLAG_RESIZABLE_LIMIT_PRESENT, FLAG_GLOBAL_MUTABLE,
	ByteCode
} = require("./const");

/************
 ** WASM encoder
 ************/

function encode_value_type(payload, type) {
	switch (type) {
	case "i32": payload.varint(VALUE_TYPES.i32); break ;
	case "i64": payload.varint(VALUE_TYPES.i64); break ;
	case "f32": payload.varint(VALUE_TYPES.f32); break ;
	case "f64": payload.varint(VALUE_TYPES.f64); break ;
	case "void": payload.varint(VALUE_TYPES.void); break ;
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
		throw new Error(`illegal external_kind ${type}`);
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

function encode_code_expr(payload, codes) {
	var index = 0;
	var depth = 1;

	while (depth > 0) {
		const code = codes[index++];
		const op = typeof code === 'string' ? code : code.op;

		if (ByteCode[op] === undefined) {
			throw new Error(`illegal byte-code ${op}`);
		}

		payload.uint8(ByteCode[op]);

		switch (op) {
		case "block":
		case "loop":
		case "if":
			encode_value_type(payload, code.kind);
			depth++;
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
			payload.varuint(code.function_index);
			break ;
		case "call_indirect":
			payload.varuint(code.type_index);
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
		case "end":
			depth--;
		}
	}
}

function encode_type_section(defs) {
	const payload = new WriteStream();

	payload.varuint(defs.length);

	defs.forEach((def) => {
		switch (def.type) {
		case "func_type":
			payload.varint(VALUE_TYPES[def.type]);
			payload.varuint(def.parameters.length);

			def.parameters.forEach((param) => encode_value_type(payload, param));

			payload.varuint(def.returns.length);
			def.returns.forEach(ret => encode_value_type(payload, ret));
			break ;
		default :
			throw new Error(`Unhandled type ${def.type}`);
		}
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
		encode_code_expr(body, def.code);

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
	{ id: PAYLOAD_TYPES.FUNCTION, name: "function_type_section", encode: encode_function_section },
	{ id: PAYLOAD_TYPES.TABLE, name: "table_section", encode: encode_table_section },
	{ id: PAYLOAD_TYPES.MEMORY, name: "memory_section", encode: encode_memory_section },
	{ id: PAYLOAD_TYPES.GLOBAL, name: "global_section", encode: encode_global_section },
	{ id: PAYLOAD_TYPES.EXPORT, name: "export_section", encode: encode_export_section },
	{ id: PAYLOAD_TYPES.START, name: "start_section", encode: encode_start_section },
	{ id: PAYLOAD_TYPES.ELEMENT, name: "element_section", encode: encode_element_section },
	{ id: PAYLOAD_TYPES.CODE, name: "function_section", encode: encode_code_section },
	{ id: PAYLOAD_TYPES.DATA, name: "data_section", encode: encode_data_section }
];

module.exports = function (ast) {
	const stream = new WriteStream();

	if (ast.magicNumber != MAGIC_NUMBER) {
		throw new Error("Invalid magic number");
	}

	if (ast.version != 1) {
		throw new Error(`Cannot encode wasm v${result.version} modules`);
	}

	stream.uint32(ast.magicNumber);
	stream.uint32(ast.version);

	// Unpack types
	var mappedTypes = {};
	ast = Object.create(ast);
	ast.function_type_section = [];

	function typeIndex(def) {
		var form;

		switch (def.type) {
		case "func_type":
			form = `func:${def.parameters.join(",")}|${def.returns.join(",")}`;
			break ;
		default:
			throw new Error(`Unrecognized type ${def.type}`);
		}

		if (mappedTypes[form] === undefined) {
			mappedTypes[form] = ast.type_section.length;
			ast.type_section.push(def);
		}

		return mappedTypes[form];
	}

	// Prepopulate type section
	if (ast.type_section) {
		ast.type_section.forEach(typeIndex);
	} else {
		ast.type_section = [];
	}


	// Unstamp the import section
	if (ast.import_section)
	ast.import_section = ast.import_section.map ((imp) => {
		switch (imp.type.type) {
		case "func_type":
			imp = Object.create(imp);
			imp.type = { type: "func_type", index: typeIndex(imp.type) };
		default:
			return imp ;
		}

	});

	// Unroll the function section
	if (ast.function_section)
	ast.function_section.forEach((func, i) => {
		ast.function_type_section.push(typeIndex(func.type));
	});

	ENCODE_TYPES.forEach((encoder) => {
		const def = ast[encoder.name];

		if (!def) return ;

		stream.varuint(encoder.id);
		const payload = encoder.encode(def);
		stream.varuint(payload.byteLength);
		stream.buffer(payload);
	});

	// Stuff in our custom blobs
	if (ast.custom)
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
