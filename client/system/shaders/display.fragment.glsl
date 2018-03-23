#version 300 es

precision mediump float;

uniform mediump usampler2D sVram;

in vec2 vTexture;
out vec4 fragColor;

void main(void) {
	uvec3 color = texture(sVram, vTexture).rgb & 0xF8u;

	fragColor.rgb = vec3(color) / vec3(239.0);
	fragColor.a = 1.0;
}
