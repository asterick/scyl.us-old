#version 300 es

precision mediump float;

uniform sampler2D sVram;
uniform sampler2D sDither;
uniform mediump usampler2D sPalette;

uniform vec2 uTextureOffset;
uniform vec2 uClutOffset;
uniform int uClutMode;

uniform bool uTextured;
uniform bool uDither;
uniform bool uMasked;

in vec2 vTexture;
in vec2 vAbsolute;
in vec3 vColor;

out vec4 fragColor;

void main(void) {
	// Load our texture
	vec4 texel;

	if (uTextured) {
		ivec2 texpos;

		if (uClutMode == 1) {
			texpos = ivec2(vTexture.x / 2.0, vTexture.y + uTextureOffset);
			texel = texelFetch(sVram, texpos, 0);

			uint word =
				(uint(texel.r * 32.0) << 11) +
				(uint(texel.g * 32.0) <<  6) +
				(uint(texel.b * 32.0) <<  1) +
				(uint(texel.a));


			uint offset = (texpos.x & 1) != 0 ? (word >> 8) : (word & 0xFFu);
			float part = float(offset) / 255.0;

			texel = vec4(part, part, part, 1.0);
		} else if (uClutMode == 2) {
			texpos = ivec2(vTexture / 4.0 + uTextureOffset);
			texel = texelFetch(sVram, texpos, 0);
		} else {
			texpos = ivec2(vTexture + uTextureOffset);
			texel = texelFetch(sVram, texpos, 0);
		}
	} else {
		texel = vec4(1.0, 1.0, 1.0, 1.0);
	}

	// Discard transparent pixels when masked
	if (uMasked && texel.a < 0.5) discard ;

	// Load our dithering offset
	vec3 dither = uDither ? texelFetch(sDither, ivec2(vAbsolute), 0).rrr / 2.0 : vec3(0,0,0);

	fragColor = vec4((texel.rgb * vColor) + dither, texel.a);
}
