precision mediump float;

attribute vec3 aColor;
attribute vec2 aVertex;
attribute vec2 aTexture;

varying vec3 vColor;
varying vec2 vTexture;

void main(void) {
	vColor = aColor;
	vTexture = aTexture;
    gl_Position = vec4(aVertex, 1.0, 1.0);
}
