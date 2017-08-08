import { ReadStream } from "./stream";
import {
	MAGIC_NUMBER,
	PAYLOAD_TYPES, VALUE_TYPES, KIND_TYPES,
	FLAG_RESIZABLE_LIMIT_PRESENT, FLAG_GLOBAL_MUTABLE,
	ByteCode, ReverseByteCode
} from "./const";

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
	case VALUE_TYPES.void: return "void";
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
			const kind = decode_value_type(payload);
			const body = decode_code_expr(payload);

			codes.push({ op: ReverseByteCode[byte], kind, body });
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
			codes.push(ReverseByteCode[byte]);
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

		switch (form) {
		case VALUE_TYPES.func_type:
			const param_count = payload.varuint();
			const parameters = [];

			while (parameters.length < param_count) parameters.push(decode_value_type(payload));

			const return_count = payload.varuint();
			const returns = [];

			while (returns.length < return_count) returns.push(decode_value_type(payload));

			definitions.push({ type: "func_type", parameters, returns });
			break ;
		default:
			throw new Error(`Unhandled form type: ${form}`);
		}
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
				throw new Error(`illegal external_kind ${kind}`);

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
	[PAYLOAD_TYPES.FUNCTION]: { name: "function_type_section", decode: decode_function_section },
	[PAYLOAD_TYPES.TABLE]: { name: "table_section", decode: decode_table_section },
	[PAYLOAD_TYPES.MEMORY]: { name: "memory_section", decode: decode_memory_section },
	[PAYLOAD_TYPES.GLOBAL]: { name: "global_section", decode: decode_global_section },
	[PAYLOAD_TYPES.EXPORT]: { name: "export_section", decode: decode_export_section },
	[PAYLOAD_TYPES.START]: { name: "start_section", decode: decode_start_section },
	[PAYLOAD_TYPES.ELEMENT]: { name: "element_section", decode: decode_element_section },
	[PAYLOAD_TYPES.CODE]: { name: "function_section", decode: decode_code_section },
	[PAYLOAD_TYPES.DATA]: { name: "data_section", decode: decode_data_section }
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

	// Type stamp the imports
	if (result.import_section)
	result.import_section.forEach((imp) => {
		switch (imp.type.type) {
		case "func_type":
			imp.type = result.type_section[imp.type.index];
			break ;
		}
	});

	// Roll up function (for ease of use)
	if (result.function_section)
	result.function_section = result.function_section.map((code, i) => {
		code.type = result.type_section[result.function_type_section[i]];
		return code;
	});

	delete result.function_type_section;
	delete result.type_section;

	return result;
}
