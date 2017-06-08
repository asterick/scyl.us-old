uniform vec2  viewSize;
uniform vec2  viewPosition;

uniform float aspectRatio;

attribute vec2 aVertex;

varying vec2 vTexture;

void main(void) {
	vTexture = (vec2(0.5, 0.5) + vec2(aVertex.x, -aVertex.y) / 2.0) * viewSize + viewPosition;
    gl_Position = vec4(aVertex * vec2(aspectRatio, 1), 1.0, 1.0);
}
