precision mediump float;

uniform vec2 uDrawSize;
uniform vec2 uDrawPos;

attribute vec3 aColor;
attribute vec2 aVertex;
attribute vec2 aTexture;

varying vec3 vColor;
varying vec2 vAbsolute;
varying vec2 vTexture;

void main(void) {
	vColor = aColor;
	vTexture = aTexture;
	vAbsolute = aVertex;
    gl_Position = vec4(aVertex / uDrawSize * 2.0 - 1.0 - uDrawPos, 1.0, 1.0);
}
