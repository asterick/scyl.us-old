precision mediump float;

varying vec2 vTexture;
uniform sampler2D vram;

void main(void) {
	gl_FragColor = vec4(texture2D(vram, vTexture).rgb, 1.0);
}
