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

	void render (GLenum type, const uint16_t* vertexes, int offset, int count, bool blend, bool textured, int color = 0);
}

const int VRAM_WIDTH = 1024;
const int VRAM_HEIGHT = 512;

uint32_t VRAM_WORDS[VRAM_WIDTH * VRAM_HEIGHT];

// 0000yyyy yyyy yyyy ???? xxxx xxxx xxxx	// Set draw X/Y
// 0001yyyy yyyy yyyy ???? xxxx xxxx xxxx	// Set texture X/Y
// 1010yyyy yyyy yyyy ?EMM xxxx xxxx xxxx	// Set CLUT mode (0 = 1bpp, 1 = 2bpp, 2 = 4bpp, 3 = 8bpp, E = enable)
// 1011???? ???? ??sm aaaa bbbb cccc dddd	// Set blend coff + masking	
// 11kkpctb	RRRR RRRR GGGG GGGG BBBB BBBB 	// Draw primitive + first color

// KK = kind (point, line, triangle, quads)
//  C = Flat shaded?
//  T = Textured? (ignored for points)
//  P = Poly (repeat until msb of X or Y is set)
//  B = Enable blending

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
	set_clut(16, 0, 0);	// Disable CLUT
	set_mask(true, false);
	set_dither(true);
	set_blend_coff(1, 0, 0.5, 0.5);
	set_texture_mask(0, 0, 0, 0);
}

uint32_t GPU::read(uint32_t address) {
	return ~0;
}

void GPU::write(uint32_t address, uint32_t value, uint32_t mask) {

}

// This prevents the compiler from being extremely stupid with some array init
__attribute__ ((optnone))
EXPORT void test_gpu() {
    set_clut(2, 0, 220);
    
    {
    	static const uint16_t temp[] = {
			0x00FF, 0x0000,   0,   0,
			0xFF00, 0x0000,   0, 240,
			0x0000, 0x00FF, 256,   0,
			0xFFFF, 0x00FF, 256, 240,
	  	};
	    render(GL_TRIANGLE_STRIP, temp, 0, 4, false, false);
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
    set_blend_coff(1.0, 0.00, 0.5, 0.5);

    {
	    static const uint16_t temp[] = {
    		0, 	  0,	// Dummy color
	        64,  64, 0, 0,
	       192,  64, 4, 0,
	        64, 192, 0, 4,
	       192, 192, 4, 4,
	   	};
	    render(GL_TRIANGLE_STRIP, temp, 0, 4, true, true, 0xFFFFFF);
	}

    {
    	static const uint16_t temp[] = {
    		0, 	  0,	// Dummy color
	    	96,  96,
	        96, 160,
	       160,  96,
	       160, 160
	   	};
	    render(GL_POINTS, temp, 0, 4, true, false, 0xFF00FF);
    }
}
