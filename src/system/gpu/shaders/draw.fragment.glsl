#version 300 es

precision mediump float;

uniform sampler2D sVram;

uniform ivec2 uTextureOffset;
uniform ivec2 uClutOffset;
uniform int uClutMode;

uniform bool uTextured;
uniform bool uMasked;
uniform bool uSetMask;

in vec2 vTexture;
in vec2 vAbsolute;
in vec4 vColor;

out vec4 fragColor;

int adjust(float a) {
	return min(31, int(a * 32.0));
}

int pack(vec4 color) {
	return (adjust(color.r) << 11) + (adjust(color.g) << 6) + (adjust(color.b) << 1) + int(color.a);
}

void main(void) {
	fragColor = vColor;

	// Load our texture
	if (uTextured) {
		ivec2 texpos;
		vec2 vTex = mod(vTexture, 256.0);

		if (uClutMode == 2) {
			texpos = ivec2(vTex.x / 4.0, vTex.y) + uTextureOffset;

			int word = pack(texelFetch(sVram, texpos, 0)) >> ((int(vTexture.x) & 3) << 2);

			texpos = uClutOffset + ivec2(word & 0xF, 0);
		} else if (uClutMode == 1) {
			texpos = ivec2(vTex.x / 2.0, vTex.y) + uTextureOffset;

			int word = pack(texelFetch(sVram, texpos, 0));

			texpos = uClutOffset + ivec2(bool(int(vTex.x) & 1) ? (word >> 8) : (word & 0xFF), 0);
		} else {
			texpos = ivec2(vTex) + uTextureOffset;
		}

		vec4 texel = texelFetch(sVram, texpos, 0);

		if (texel.a < 0.5) discard ;

		fragColor.rgb *= texel.rgb;
		fragColor.a = uSetMask ? 1.0 : texel.a;
	}
}
