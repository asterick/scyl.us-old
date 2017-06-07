attribute vec2 aVertexPosition;
attribute vec2 aTexturePosition;

uniform mat4 uPMatrix;

varying vec2 vTexturePosition;

void main(void) {
	vTexturePosition = aTexturePosition;
    gl_Position = uPMatrix * vec4(aVertexPosition, 0.5, 1.0);
}
