precision mediump float;

uniform vec2 textureOffset;

attribute vec3 aColor;
attribute vec2 aVertex;
attribute vec2 aTexture;

varying vec3 vColor;
varying vec2 vTexture;

void main(void) {
	vColor = aColor;
	vTexture = mod(aTexture, vec2(256.0 / 1024.0, 256.0 / 512.0)) + textureOffset;
    gl_Position = vec4(aVertex, 0.5, 1.0);
}
