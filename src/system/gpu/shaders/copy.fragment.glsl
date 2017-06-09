#version 300 es

precision mediump float;

in vec2 vTexture;

out vec4 fragColor;

uniform sampler2D sVram;
uniform bool uDither;
const int ordered_dither[16] = int[](15, 7, 13, 5, 3, 11, 1, 9, 12, 4, 14, 6, 0, 8, 2, 10);

void main(void) {
	fragColor = texelFetch(sVram, ivec2(vTexture), 0);

	// We use a custom dithering engine
	if (uDither) {
		ivec2 ditherCoord = ivec2(vTexture) % 4;
		int ditherVal = ordered_dither[(ditherCoord.g << 2) | ditherCoord.r];
		fragColor.rgb += float(ditherVal) / 512.0;
	}
}
