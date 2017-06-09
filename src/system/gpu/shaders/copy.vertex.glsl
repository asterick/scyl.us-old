#version 300 es

uniform vec2 uDrawPosition;
uniform vec2 uDrawSize;

in vec2 aVertex;

out vec2 vTexture;

void main(void) {
	vTexture = (aVertex + 1.0) / 2.0 * uDrawSize + uDrawPosition;
    gl_Position = vec4(aVertex, 1.0, 1.0);
}
