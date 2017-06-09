#version 300 es

precision mediump float;

in vec2 vTexture;
out vec4 fragColor;

uniform mediump usampler2D sVram;
uniform sampler2D sPalette;

void main(void) {
	uvec2 color = texelFetch(sVram, ivec2(vTexture), 0).rg;
	fragColor = texelFetch(sPalette, ivec2(color), 0);
}
