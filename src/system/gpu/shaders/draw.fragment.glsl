#version 300 es

precision mediump float;

uniform mediump usampler2D sVram;

uniform ivec2 uTextureOffset;
uniform ivec2 uClutOffset;
uniform int uClutMode;

uniform bool uTextured;
uniform bool uMasked;
uniform bool uSetMask;
uniform bool uDither;

in vec2 vTexture;
in vec2 vAbsolute;
in vec4 vColor;

out uvec4 fragColor;

const uint ordered_dither[] = uint[](15u, 7u, 13u, 5u, 3u, 11u, 1u, 9u, 12u, 4u, 14u, 6u, 0u, 8u, 2u, 10u);

uint adjust(uint a) {
	return a >> 3;
}

uint pack(uvec4 color) {
	return (adjust(color.r) << 11) + (adjust(color.g) << 6) + (adjust(color.b) << 1) + (color.a >= 128u ? 1u : 0u);
}

void main(void) {
	fragColor = uvec4(vColor * 255.0);

	// Load our texture
	if (uTextured) {
		ivec2 iVec = ivec2(vTexture);
		ivec2 texpos = (ivec2(iVec.x / uClutMode, iVec.y) & 0xFF) + uTextureOffset;

		if (uClutMode == 4) {
			uint word = pack(texelFetch(sVram, texpos, 0)) >> ((iVec.x & 3) << 2);
			iVec = uClutOffset + ivec2(word & 0xFu, 0);
		} else if (uClutMode == 2) {
			uint word = pack(texelFetch(sVram, texpos, 0));
			iVec = uClutOffset + ivec2(bool(texpos.x & 1) ? (word >> 8u) : (word & 0xFFu), 0);
		}

		uvec4 texel = texelFetch(sVram, iVec, 0);

		//if (texel.a < 128u) discard ;

		fragColor.rgb = (fragColor.rgb * texel.rgb) >> 8;
		fragColor.a = uSetMask ? 0xFFu : texel.a;
	}

	// We use a custom dithering engine
	if (uDither) {
		ivec2 ditherCoord = ivec2(vAbsolute) % 4;
		fragColor.rgb = fragColor.rgb + ordered_dither[ditherCoord.g * 4 + ditherCoord.r];
	}

	fragColor.rgb &= 0x1F8u;
}
