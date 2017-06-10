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

uint pack(uvec4 color) {
	return (color.r >> 3) | ((color.g >> 3) << 5) | ((color.b >> 3) << 10) | (color.a >= 128u ? 0x8000u : 0u);
}

void main(void) {
	// Load our texture
	if (uTextured) {
		ivec2 iVec = ivec2(vTexture) & 0xFF;
		ivec2 texpos;

		// Paletted mode
		if (uClutMode > 0) {
			uint word = pack(texelFetch(sVram, ivec2(iVec.x >> uClutMode, iVec.y) + uTextureOffset, 0));
			int index = (iVec.x & ((1 << uClutMode) - 1)) << (4 - uClutMode);
			uint mask = uint((1 << (1 << uClutMode)) - 1);
		
			texpos = ivec2((word >> index) & mask, 0) + uClutOffset;
		} else {
			texpos = iVec + uTextureOffset;
		}

		uvec4 texel = texelFetch(sVram, texpos, 0);

		if (uMasked && texel.a < 128u) discard ;

		fragColor.rgb = uvec3(vColor.rgb * vec3(texel.rgb & 0xF8u));
		fragColor.a   = uSetMask ? 0xFFu : (texel.a >= 0x80u ? 0xFFu : 0u);
	} else {
		fragColor = uvec4(vColor * 255.0);
	}

	// We use a custom dithering engine
	if (uDither) {
		ivec2 ditherCoord = ivec2(vAbsolute) % 4;
		fragColor.rgb = ((fragColor.rgb << 1) + ordered_dither[ditherCoord.g * 4 + ditherCoord.r]) >> 1;
	}
}
