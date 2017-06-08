#version 300 es
precision mediump float;

uniform vec2 uDrawSize;
uniform vec2 uDrawPos;

in vec3 aColor;
in vec2 aVertex;
in vec2 aTexture;

out vec3 vColor;
out vec2 vAbsolute;
out vec2 vTexture;

void main(void) {
	vColor = aColor;
	vTexture = aTexture;
	vAbsolute = aVertex;

    gl_Position = vec4(aVertex / uDrawSize * 2.0 - 1.0 - uDrawPos, 1.0, 1.0);
}
