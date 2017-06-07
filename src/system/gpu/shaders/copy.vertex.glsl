attribute vec2 aVertex;
attribute vec2 aTexture;

varying vec2 vTexture;

uniform mat4 projection;

void main(void) {
	vTexture = aTexture;
    gl_Position = projection * vec4(aVertex, 0.5, 1.0);
}
