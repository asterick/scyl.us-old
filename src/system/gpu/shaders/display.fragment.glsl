#version 300 es

precision mediump float;

uniform sampler2D sVram;

in vec2 vTexture;
out vec4 fragColor;

void main(void) {
	fragColor = texture(sVram, vTexture);
}
