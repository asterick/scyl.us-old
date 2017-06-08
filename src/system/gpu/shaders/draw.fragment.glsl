precision mediump float;

uniform sampler2D sVram;
uniform sampler2D sDither;

uniform vec2 uTextureOffset;
uniform vec2 uClutOffset;
uniform int uClutMode;

uniform bool uTextured;
uniform bool uDither;
uniform bool uMasked;

varying vec2 vTexture;
varying vec2 vAbsolute;
varying vec3 vColor;

const vec2 cTextureRegionMode0 = vec2(256.0 / 1024.0, 256.0 / 512.0);
const vec2 cTextureRegionMode1 = vec2(128.0 / 1024.0, 256.0 / 512.0);
const vec2 cTextureRegionMode2 = vec2( 64.0 / 1024.0, 256.0 / 512.0);

const vec2 cTextureSize = vec2(1.0/256.0, 1.0/256.0);
const vec2 cVramSize = vec2(1.0/1024.0, 1.0/512.0);

int func_mod(int x, int y) {
    return int(float(x)-float(y)*floor(float(x)/float(y)));
}

void main(void) {
	// Load our texture
	vec4 texel;

	// 8BPP mode
	if (uTextured) {
		vec2 texpos;

		if (uClutMode == 1) {
			texpos = fract(vTexture * cTextureSize) * cTextureRegionMode1 + uTextureOffset;
			texel = texture2D(sVram, texpos);
		} else if (uClutMode == 2) {
			texpos = fract(vTexture * cTextureSize) * cTextureRegionMode2 + uTextureOffset;
			texel = texture2D(sVram, texpos);
		} else {
			texpos = fract(vTexture * cTextureSize) * cTextureRegionMode0 + uTextureOffset;
			texel = texture2D(sVram, texpos);
		}
	} else {
		texel = vec4(1.0, 1.0, 1.0, 1.0);
	}

	// Discard transparent pixels when masked
	if (uMasked && texel.a < 0.5) discard ;

	// Load our dithering offset
	vec3 dither = uDither ? texture2D(sDither, vAbsolute / 8.0).rrr / 2.0 : vec3(0,0,0);

	gl_FragColor = vec4((texel.rgb * vColor) + dither, texel.a);
}
