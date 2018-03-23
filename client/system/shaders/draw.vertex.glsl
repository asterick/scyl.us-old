#version 300 es

precision mediump float;

uniform vec2 uClipSize;
uniform vec2 uClipPos;
uniform vec2 uDrawPos;

in int aColor;
in ivec2 aVertex;
in ivec2 aTexture;

out vec2 vAbsolute;
out vec2 vTexture;
out vec3 vColor;
flat out lowp uint vMask;

vec3 unpack(int color) {
	return vec3(
			float(color & 0x1F) / 31.0,
			float((color >>  5) & 0x1F) / 31.0,
			float((color >> 10) & 0x1F) / 31.0
		);
}

void main(void) {
	vColor    = unpack(aColor);
	vMask	  = bool(aColor < 0) ? 0xFFu : 0u;
	vTexture  = vec2(aTexture);
	vAbsolute = vec2(aVertex) + uDrawPos;

    gl_PointSize = 1.0;
    gl_Position = vec4((vAbsolute - uClipPos) / vec2(uClipSize) * 2.0 - 1.0, 1.0, 1.0);
}
