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

uint adjust(float a) {
	return min(31u, uint(a * 32.0));
}

void main(void) {
	vec4 texel;

	// Load our texture
	if (uTextured) {
		ivec2 texpos;

		if (uClutMode == 2) {
			texpos = ivec2(vTexture.x / 4.0, vTexture.y) + uTextureOffset;
			texpos = ivec2(texelFetch(sVram, texpos, 0));

			int nybble = int(vTexture.x) & 3;
			if (nybble == 0) 		texpos = uClutOffset + ivec2(texpos.r & 0xF, 0);
			else if (nybble == 1)	texpos = uClutOffset + ivec2(texpos.r >>  4, 0);
			else if (nybble == 2)	texpos = uClutOffset + ivec2(texpos.g & 0xF, 0);
			else					texpos = uClutOffset + ivec2(texpos.g >>  4, 0);
		} else if (uClutMode == 1) {
			texpos = ivec2(vTexture.x / 2.0, vTexture.y) + uTextureOffset;
			texpos = ivec2(texelFetch(sVram, texpos, 0));

			texpos = uClutOffset + ivec2(bool(int(vTexture.x) & 1) ? texpos.r : texpos.g, 0);
		} else {
			texpos = ivec2(vTexture) + uTextureOffset;
		}

		uvec2 packed = texelFetch(sVram, texpos, 0).rg;

		if (uMasked && !bool(packed.r & 1u)) discard ;

		texel = texelFetch(sPalette, ivec2(packed), 0);
	} else {
		texel = vec4(1.0, 1.0, 1.0, 1.0);
	}

	float dither = uDither ? texelFetch(sDither, ivec2(vAbsolute) % 4, 0).r / 2.0 : 0.0;

	texel = vec4(texel.rgb * vColor + dither, texel.a);
	uint word = (adjust(texel.r) << 11) + (adjust(texel.g) << 6) + (adjust(texel.b) << 1) + uint(texel.a);

	fragColor = uvec2(word & 0xFFu, word >> 8);
}
