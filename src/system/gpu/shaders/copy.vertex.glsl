attribute vec2 aVertex;
attribute vec2 aTexture;

varying vec2 vTexture;

void main(void) {
	vTexture = aTexture;
    gl_Position = vec4(aVertex, 1.0, 1.0);
}
