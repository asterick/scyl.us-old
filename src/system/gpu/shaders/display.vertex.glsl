#version 300 es

uniform vec2 uViewportSize;
uniform vec2 uViewportPosition;
uniform float uAspectRatio;

in vec2 aVertex;
out vec2 vTexture;

const vec2 vram_size = vec2(1024.0, 512.0);

void main(void) {
    vTexture = (aVertex * vec2(1.0, -1.0) + 1.0) * uViewportSize / vram_size / 2.0 + uViewportPosition;
    gl_Position = vec4(aVertex.x * uAspectRatio, aVertex.y, 1.0, 1.0);
}
