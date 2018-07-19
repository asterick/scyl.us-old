#version 300 es

uniform float uAspectRatio;

in vec2 aVertex;
out vec2 vTexture;

void main(void) {
    vTexture = aVertex;
    gl_Position = vec4(aVertex.x * uAspectRatio, aVertex.y, 1.0, 1.0);
}
