#version 300 es

precision mediump float;

uniform vec2 uClipSize;
uniform vec2 uClipPos;
uniform vec2 uDrawPos;

in ivec2 aColor;
in ivec2 aVertex;
in ivec2 aTexture;

out vec2 vAbsolute;
out vec2 vTexture;
out vec3 vColor;

vec3 unpack(ivec2 color) {
	return vec3(float(color.g & 0xFF) / 255.0,
				float((color.r >> 8) & 0xFF) / 255.0,
				float(color.r & 0xFF) / 255.0);
}

void main(void) {
	vColor    = unpack(aColor);
	vTexture  = vec2(aTexture);
	vAbsolute = vec2(aVertex) + uDrawPos;

    gl_PointSize = 1.0;
    gl_Position = vec4((vAbsolute - uClipPos) / vec2(uClipSize) * 2.0 - 1.0, 1.0, 1.0);
}
