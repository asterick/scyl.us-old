precision mediump float;

uniform sampler2D vram;

varying vec2 vTexture;
varying vec3 vColor;

uniform vec2 textureOffset;
uniform vec2 clutOffset;

const vec2 textureRegion = vec2(256.0 / 1024.0, 256.0 / 512.0);

void main(void) {
	vec2 texpos = fract(vTexture) * textureRegion + textureOffset;
	gl_FragColor = texture2D(vram, texpos) * vec4(vColor, 1.0);
}
