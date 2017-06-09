#version 300 es

in vec2 aVertex;
in vec2 aTexture;

out vec2 vTexture;

void main(void) {
	vTexture = aTexture;
    gl_Position = vec4(aVertex, 1.0, 1.0);
}
