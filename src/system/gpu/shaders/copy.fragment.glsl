precision mediump float;

uniform sampler2D uSampler;
varying vec2 vTexturePosition;

void main(void) {
	gl_FragColor = vec4(texture2D(uSampler, vTexturePosition).rgb, 1.0);
}
