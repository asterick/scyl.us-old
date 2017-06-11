#version 300 es

precision mediump float;

uniform mediump usampler2D sVram;

uniform bool uTextured;
uniform ivec2 uTextureOffset;
uniform ivec2 uClutOffset;

uniform int uClutMode;
uniform int uClutIndexMask;
uniform int uClutIndexShift;
uniform uint uClutColorMask;

uniform bool uSemiTransparent;
uniform vec2 uSetCoff;
uniform vec2 uResetCoff;

uniform bool uMasked;
uniform bool uSetMask;
uniform bool uDither;

in vec2 vTexture;
in vec2 vAbsolute;
in vec3 vColor;
flat in lowp uint vMask;

out uvec4 fragColor;

const uint ordered_dither[] = uint[](0u, 4u, 1u, 5u, 6u, 2u, 7u, 3u, 1u, 5u, 0u, 4u, 7u, 3u, 6u, 2u);

void main(void) {
	ivec2 vramTarget = ivec2(vAbsolute);

	// Load our texture
	if (uTextured) {
		ivec2 iVec = ivec2(vTexture) & 0xFF;
		ivec2 texpos;

		// Paletted mode
		if (uClutMode > 0) {
			uvec4 color = texelFetch(sVram, ivec2(iVec.x >> uClutMode, iVec.y) + uTextureOffset, 0);
			uint word = (color.r >> 3) | ((color.g >> 3) << 5) | ((color.b >> 3) << 10) | (color.a >= 128u ? 0x8000u : 0u);
		
			texpos = ivec2((word >> ((iVec.x & uClutIndexMask) << uClutIndexShift)) & uClutColorMask, 0) + uClutOffset;
		} else {
			texpos = iVec + uTextureOffset;
		}

		uvec4 texel = texelFetch(sVram, texpos, 0);
		bool maskClear = texel.a < 128u;

		if (uMasked && maskClear) discard ;

		fragColor.rgb = uvec3(vColor * vec3(texel.rgb & 0xF8u));
		fragColor.a   = uSetMask ? vMask : (maskClear ? 0u : 0xFFu);
	} else {
		fragColor = uvec4(vColor * 255.0, vMask);
	}

	// Blending work
	if (uSemiTransparent) {
		uvec3 prev = texelFetch(sVram, vramTarget, 0).rgb;
		vec2 coffs = (fragColor.a >= 0x80u) ? uSetCoff : uResetCoff;

		fragColor.rgb = uvec3(vec3(fragColor.rgb) * coffs.xxx + vec3(prev.rgb) * coffs.yyy);
	}

	// We use a custom dithering engine
	if (uDither) {
		ivec2 ditherCoord = vramTarget % 4;
		fragColor.rgb = fragColor.rgb + ordered_dither[ditherCoord.g * 4 + ditherCoord.r];
	}
}
