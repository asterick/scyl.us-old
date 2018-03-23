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
	void set_blend(bool blend, float setSrcCoff, float setDstCoff, float resetSrcCoff, float resetDstCoff);
	void set_texture(uint16_t x, uint16_t y);
	void set_clut(bool enable, int mode, uint16_t x, uint16_t y);
	void set_draw(uint16_t x, uint16_t y);
	void set_clip(uint16_t x, uint16_t y, uint16_t width, uint16_t height);
	void set_viewport (uint16_t x, uint16_t y, uint16_t width, uint16_t height);
	void set_dither (bool dither);
	void set_mask (bool masked, bool setMask);
	void get_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint32_t* target);
	void set_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, const uint32_t* target);
	void render (GLenum type, int offset, int count, bool textured, int color, const uint16_t* vertexes);
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

void GPU::reset() {
	// Initialization state
	set_viewport(0, 0, 256, 240);
	set_clip(0, 0, 256, 240);
	set_draw(0, 0);
	set_texture(0, 0);
	set_clut(false, 0, 0, 0);
	set_mask(true, false);
	set_dither(true);
	set_blend(false, 0, 0, 0, 0);
}

uint32_t GPU::read(uint32_t) {
	return ~0;
}

void GPU::write(uint32_t, uint32_t, uint32_t) {

}

// This prevents the compiler from being extremely stupid with some array init
__attribute__ ((optnone))
EXPORT void test_gpu() {
    set_clut(true, 2, 0, 220);
    
    {
    	static const uint16_t temp[] = {
	        0,   0, 0b1000000000000000,
	        0, 240, 0b1000000000011111,
	      256, 240, 0b1111111111100000,
	      256,   0, 0b1111110000000000,
	  	};
	    render(GL_TRIANGLE_FAN, 0, 4, false, -1, temp);
    }

    {
	    uint16_t palette[16];
	    
	    for (int i = 0; i < 16; i++) {
	    	palette[i] = (i * 0x42) | (((i % 5) == 0) ? 0x8000 : 0);
	    }

	    write_data(0, 220, 16, 1, palette);
    }
    
    {
	   	static const uint16_t px[] = {
	        0x3210,
	        0x7654,
	        0xBA98,
	        0xFEDC
	   	};

	   	uint16_t px2[4];
	    write_data(0, 0, 1, 4, px);
	    read_data(0, 0, 1, 4, px2);
	    
	    for (int i = 0; i < 4; i++)
		if (px[i] != px2[i]) {
	    	DEBUG(999, (uint32_t) i, px[i], px2[i]);
	    	break ;
	    }
    }
    
    set_mask(false, false);
    set_blend(true, 1.0, 0.00, 0.50, 0.50);

    {
	    static const uint16_t temp[] = {
	        64,  64, 0, 0,
	        64, 192, 0, 4,
	       192,  64, 4, 0,
	       192, 192, 4, 4,
	   	};
	    render(GL_TRIANGLE_STRIP, 0, 4, true, 0b1111111111111111, temp);
	}

    {
    	static const uint16_t temp[] = {
	    	96,  96,
	        96, 160,
	       160,  96,
	       160, 160
	   	};
	    render(GL_POINTS, 0, 4, false, 0b1111111111111111, temp);
    }
}
