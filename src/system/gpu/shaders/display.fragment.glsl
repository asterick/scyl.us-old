#version 300 es

precision mediump float;

uniform mediump usampler2D sVram;

in vec2 vTexture;
out vec4 fragColor;

void main(void) {
	fragColor = vec4(texture(sVram, vTexture)) / vec4(239.0, 239.0, 239.0, 255.0);
}
