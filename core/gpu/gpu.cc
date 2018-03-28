#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "system.h"
#include "gl2.h"

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "gpu.h"

extern "C" {
	void set_blend_coff(float setSrcCoff, float setDstCoff, float resetSrcCoff, float resetDstCoff);
	void set_texture(uint16_t x, uint16_t y);
	void set_texture_mask(uint16_t mx, uint16_t my, uint16_t ox, uint16_t oy);
	void set_clut(int mode, uint16_t x, uint16_t y);
	void set_draw(uint16_t x, uint16_t y);
	void set_clip(uint16_t x, uint16_t y, uint16_t width, uint16_t height);
	void set_viewport (uint16_t x, uint16_t y, uint16_t width, uint16_t height);
	void set_dither (bool dither);
	void set_mask (bool masked, bool setMask);
	void get_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint32_t* target);
	void set_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, const uint32_t* target);

	void render (GLenum type, const uint16_t* vertexes, int offset, int count, bool blend, bool textured, bool shaded);
}

const int VRAM_WIDTH = 1024;
const int VRAM_HEIGHT = 512;

uint32_t VRAM_WORDS[VRAM_WIDTH * VRAM_HEIGHT];

static void read_data(uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint16_t* target) {
	get_vram_data(x, y, width, height, VRAM_WORDS);

	int words = width * height;
	const uint32_t* source = VRAM_WORDS;

	while (words-- > 0) {
		uint32_t i = *(source++);
		uint16_t r = (i >>  3) & 0x001F;
		uint16_t g = (i >>  8) & 0x03C0;
		uint16_t b = (i >> 13) & 0x7C00;
		uint16_t a = (i >> 16) & 0x8000;

		*(target++) = r | g | b | a;
	}
}

static void write_data(uint16_t x, uint16_t y, uint16_t width, uint16_t height, const uint16_t* source) {
	int words = width * height;
	uint32_t* target = VRAM_WORDS;

	while (words-- > 0) {
		uint32_t i = *(source++);
		uint32_t r = (i <<  3) & 0x000000F8;
		uint32_t g = (i <<  6) & 0x0000F800;
		uint32_t b = (i <<  9) & 0x00F80000;
		uint32_t a = (i << 16) & 0x80000000;

		*(target++) = r | g | b | a;
	}

	set_vram_data(x, y, width, height, VRAM_WORDS);
}

uint32_t GPU::read(uint32_t address) {
	return ~0;
}

void GPU::write(uint32_t address, uint32_t value, uint32_t mask) {

}
