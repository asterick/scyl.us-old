precision mediump float;

uniform sampler2D sVram;
uniform sampler2D sDither;

uniform vec2 uTextureOffset;
uniform vec2 uClutOffset;
uniform bool uTextured;
uniform bool uDither;

varying vec2 vTexture;
varying vec2 vAbsolute;
varying vec3 vColor;

const vec2 cTextureRegion = vec2(256.0 / 1024.0, 256.0 / 512.0);

void main(void) {
	vec2 texpos = fract(vTexture) * cTextureRegion + uTextureOffset;
	vec4 texel = uTextured ? texture2D(sVram, texpos) : vec4(1.0, 1.0, 1.0, 1.0);
	vec4 dither = uDither ? texture2D(sVram, vAbsolute / 4.0) / 2.0 : vec4(0,0,0,0);
	vec4 color = vec4(vColor, 1.0);

	gl_FragColor = (texel * color) + dither;
}
