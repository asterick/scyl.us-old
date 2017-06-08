precision mediump float;

varying vec2 vTexture;
uniform sampler2D vram;

void main(void) {
	gl_FragColor = texture2D(vram, vTexture);
}
