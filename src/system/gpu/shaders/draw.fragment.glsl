#version 300 es

precision mediump float;

uniform mediump usampler2D sVram;
uniform sampler2D sDither;
uniform sampler2D sPalette;

uniform ivec2 uTextureOffset;
uniform ivec2 uClutOffset;
uniform int uClutMode;

uniform bool uTextured;
uniform bool uDither;
uniform bool uMasked;

in vec2 vTexture;
in vec2 vAbsolute;
in vec3 vColor;

out uvec2 fragColor;

const int ordered_dither[16] = int[](15, 7, 13, 5, 3, 11, 1, 9, 12, 4, 14, 6, 0, 8, 2, 10);

uint adjust(float a) {
	return min(31u, uint(a * 32.0));
}

void main(void) {
	vec4 texel;

	// Load our texture
	if (uTextured) {
		ivec2 texpos;
		vec2 vTex = mod(vTexture, 256.0);

		if (uClutMode == 2) {
			texpos = ivec2(vTex.x / 4.0, vTex.y) + uTextureOffset;
			texpos = ivec2(texelFetch(sVram, texpos, 0));

			int word = (texpos.r | (texpos.g << 8)) >> ((int(vTexture.x) & 3) << 2);

			texpos = uClutOffset + ivec2(word & 0xF, 0);
		} else if (uClutMode == 1) {
			texpos = ivec2(vTex.x / 2.0, vTex.y) + uTextureOffset;
			texpos = ivec2(texelFetch(sVram, texpos, 0));

			texpos = uClutOffset + ivec2(bool(int(vTex.x) & 1) ? texpos.r : texpos.g, 0);
		} else {
			texpos = ivec2(vTex) + uTextureOffset;
		}

		uvec2 pack = texelFetch(sVram, texpos, 0).rg;

		if (uMasked && !bool(pack.r & 1u)) discard ;

		texel = texelFetch(sPalette, ivec2(pack), 0);
	} else {
		texel = vec4(1.0, 1.0, 1.0, 1.0);
	}

	texel.rgb *= vColor;

	if (uDither) {
		ivec2 ditherCoord = ivec2(vAbsolute) % 4;
		int ditherVal = ordered_dither[(ditherCoord.g << 2) | ditherCoord.r];
		texel.rgb += float(ditherVal) / 512.0;
	}

	// Pack color
	uint word = (adjust(texel.r) << 11) + (adjust(texel.g) << 6) + (adjust(texel.b) << 1) + uint(texel.a);
	fragColor = uvec2(word & 0xFFu, word >> 8);
}
