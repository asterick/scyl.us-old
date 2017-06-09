#version 300 es
precision mediump float;

uniform vec2 uDrawSize;
uniform vec2 uDrawPos;

in uint aColor;
in ivec2 aVertex;
in ivec2 aTexture;

out vec4 vColor;
out vec2 vAbsolute;
out vec2 vTexture;

vec4 unpack(uint color) {
	return vec4(
			float((color >> 11) & 0x1Fu) / 31.0,
			float((color >>  6) & 0x1Fu) / 31.0,
			float((color >>  1) & 0x1Fu) / 31.0,
			float(color & 1u)
		);
}

void main(void) {
	vColor    = unpack(aColor);
	vTexture  = vec2(aTexture);
	vAbsolute = vec2(aVertex);

    gl_PointSize = 1.0;
    gl_Position = vec4(vAbsolute / vec2(uDrawSize) * 2.0 - 1.0 - vec2(uDrawPos), 1.0, 1.0);
}
