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
	void set_texture_mask(uint16_t mx, uint16_t my, uint16_t ox, uint16_t oy);
	void set_blend_coff(float setSrcCoff, float setDstCoff, float resetSrcCoff, float resetDstCoff);
	void set_dither (bool dither);
	void set_mask (bool masked, bool setMask);
	void set_clut(int mode, uint16_t x, uint16_t y);
	void set_texture(uint16_t x, uint16_t y);
	void set_draw(uint16_t x, uint16_t y);
	void set_clip_pos(uint16_t x, uint16_t y);
	void set_viewport_pos(uint16_t x, uint16_t y);
	void set_clip_size(uint16_t width, uint16_t height);
	void set_viewport_size(uint16_t width, uint16_t height);

	void get_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint32_t* target);
	void set_vram_data (uint16_t x, uint16_t y, uint16_t width, uint16_t height, const uint32_t* target);

	void render (GLenum type, const uint16_t* vertexes, int count, bool blend, bool textured, bool shaded);
}

static const float blend_coffs[] = {
	 1.000f,  0.500f,  0.250f,  0.125f,  0.000f,  0.500f,  0.750f,  0.875f,
	-1.000f, -0.500f, -0.250f, -0.125f, -0.000f, -0.500f, -0.750f, -0.875f
};

static const int fifo_depth = 1024;

uint32_t read_fifo[VRAM_WIDTH * VRAM_HEIGHT];
uint32_t read_depth = 0;
uint32_t read_size = 0;

uint32_t write_fifo[fifo_depth];
uint32_t write_depth = 0;

static void read_data(uint16_t x, uint16_t y, uint16_t width, uint16_t height, uint16_t* target) {
	get_vram_data(x, y, width, height, read_fifo);

	int words = width * height;
	const uint32_t* source = read_fifo;

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
	uint32_t* target = read_fifo;

	while (words-- > 0) {
		uint32_t i = *(source++);
		uint32_t r = (i <<  3) & 0x000000F8;
		uint32_t g = (i <<  6) & 0x0000F800;
		uint32_t b = (i <<  9) & 0x00F80000;
		uint32_t a = (i << 16) & 0x80000000;

		*(target++) = r | g | b | a;
	}

	set_vram_data(x, y, width, height, read_fifo);
}

__attribute__ ((optnone))
static bool process_fifo() {
	uint32_t cmd = write_fifo[0];

	switch (cmd & 0xF0000000) {
	case GPU_TEXSIZE_COMMAND:
		{
			const int mx = ((cmd & GPU_TEXSIZE_MASK_X_MASK) >> GPU_TEXSIZE_MASK_X_SHIFT) << 3;
			const int my = ((cmd & GPU_TEXSIZE_MASK_Y_MASK) >> GPU_TEXSIZE_MASK_Y_SHIFT) << 3;
			const int ox = ((cmd & GPU_TEXSIZE_OFF_X_MASK) >> GPU_TEXSIZE_OFF_X_SHIFT) << 3;
			const int oy = ((cmd & GPU_TEXSIZE_OFF_Y_MASK) >> GPU_TEXSIZE_OFF_Y_SHIFT) << 3;
			set_texture_mask(mx, my, ox, oy);
		}
		break ;
	case GPU_DRAWCONFIG_COMMAND:
		{
			const uint32_t a = (cmd & GPU_DRAWCONFIG_SET_SRC_MASK) >> GPU_DRAWCONFIG_SET_SRC_SHIFT;
			const uint32_t b = (cmd & GPU_DRAWCONFIG_SET_DST_MASK) >> GPU_DRAWCONFIG_SET_DST_SHIFT;
			const uint32_t c = (cmd & GPU_DRAWCONFIG_RESET_SRC_MASK) >> GPU_DRAWCONFIG_RESET_SRC_SHIFT;
			const uint32_t d = (cmd & GPU_DRAWCONFIG_RESET_DST_MASK) >> GPU_DRAWCONFIG_RESET_DST_SHIFT;

			const float s_s = blend_coffs[(cmd & GPU_DRAWCONFIG_SET_SRC_MASK) >> GPU_DRAWCONFIG_SET_SRC_SHIFT];
			const float s_d = blend_coffs[(cmd & GPU_DRAWCONFIG_SET_DST_MASK) >> GPU_DRAWCONFIG_SET_DST_SHIFT];
			const float r_s = blend_coffs[(cmd & GPU_DRAWCONFIG_RESET_SRC_MASK) >> GPU_DRAWCONFIG_RESET_SRC_SHIFT];
			const float r_d = blend_coffs[(cmd & GPU_DRAWCONFIG_RESET_DST_MASK) >> GPU_DRAWCONFIG_RESET_DST_SHIFT];

			set_blend_coff(s_s, s_d, r_s, r_d);

			const bool dither = (cmd & GPU_DRAWCONFIG_DITHER) != 0;

			set_dither(dither);

			const bool setmask = (cmd & GPU_DRAWCONFIG_SETMASK) != 0;
			const bool usemask = (cmd & GPU_DRAWCONFIG_USEMASK) != 0;

			set_mask(usemask, setmask);
		}
		break ;
	case GPU_CLUT_COMMAND:
		{
			const int mode = (cmd & GPU_CLUT_MODE_MASK) >> GPU_CLUT_MODE_SHIFT;
			const int x = (cmd & GPU_CLUT_X_MASK) >> GPU_CLUT_X_SHIFT;
			const int y = (cmd & GPU_CLUT_Y_MASK) >> GPU_CLUT_Y_SHIFT;

			set_clut(1 << mode, x, y);
		}
		break ;
	case GPU_TEXPOS_COMMAND:
		{
			const int x = (cmd & GPU_TEXPOS_X_MASK) >> GPU_TEXPOS_X_SHIFT;
			const int y = (cmd & GPU_TEXPOS_Y_MASK) >> GPU_TEXPOS_Y_SHIFT;

			set_texture(x * 16, y * 16);
		}
		break ;
	case GPU_DRAWPOS_COMMAND:
		{
			const int x = (cmd & GPU_DRAWPOS_X_MASK) >> GPU_DRAWPOS_X_SHIFT;
			const int y = (cmd & GPU_DRAWPOS_Y_MASK) >> GPU_DRAWPOS_Y_SHIFT;

			set_draw(x, y);
		}
		break ;
	case GPU_CLIPPOS_COMMAND:
		{
			const int x = (cmd & GPU_CLIPPOS_X_MASK) >> GPU_CLIPPOS_X_SHIFT;
			const int y = (cmd & GPU_CLIPPOS_Y_MASK) >> GPU_CLIPPOS_Y_SHIFT;

			set_clip_pos(x, y);
		}
		break ;
	case GPU_VIEWSTART_COMMAND:
		{
			const int x = (cmd & GPU_VIEWSTART_X_MASK) >> GPU_VIEWSTART_X_SHIFT;
			const int y = (cmd & GPU_VIEWSTART_Y_MASK) >> GPU_VIEWSTART_Y_SHIFT;

			set_viewport_pos(x, y);
		}
		break ;
	case GPU_CLIPSIZE_COMMAND:
		{
			const int x = (cmd & GPU_CLIPSIZE_WIDTH_MASK) >> GPU_CLIPSIZE_WIDTH_SHIFT;
			const int y = (cmd & GPU_CLIPSIZE_HEIGHT_MASK) >> GPU_CLIPSIZE_HEIGHT_SHIFT;

			set_clip_size(x, y);
		}
		break ;
 	case GPU_GETDATA_COMMAND:
 		{
 			if (read_depth < read_size || write_depth < 2) return false;

			const uint32_t param = write_fifo[1];
			const uint32_t width = ((cmd & GPU_GETDATA_WIDTH_MASK) >> GPU_GETDATA_WIDTH_SHIFT) & ~1;
			const uint32_t height = (cmd & GPU_GETDATA_HEIGHT_MASK) >> GPU_GETDATA_HEIGHT_SHIFT;
			const uint32_t x = (param & GPU_POINT_X_MASK) >> GPU_POINT_X_SHIFT;
			const uint32_t y = (param & GPU_POINT_Y_MASK) >> GPU_POINT_Y_SHIFT;

			read_data(x, y, width, height, (uint16_t*) read_fifo);
			read_depth = 0;
			read_size = width * height / 2;
		}
 		break ;
 	case GPU_SETDATA_COMMAND:
 		{
			const uint32_t width = ((cmd & GPU_GETDATA_WIDTH_MASK) >> GPU_GETDATA_WIDTH_SHIFT);
			const uint32_t height = (cmd & GPU_GETDATA_HEIGHT_MASK) >> GPU_GETDATA_HEIGHT_SHIFT;

 			if (write_depth < 2 + (width * height / 2)) return false;

			const uint32_t param = write_fifo[1];
			const uint32_t x = (param & GPU_POINT_X_MASK) >> GPU_POINT_X_SHIFT;
			const uint32_t y = (param & GPU_POINT_Y_MASK) >> GPU_POINT_Y_SHIFT;

 			write_data(x, y, width, height, (const uint16_t*) &write_fifo[2]);
		}
 		break ;
	case GPU_COMMAND_POINT:
		{
			if (write_depth < 2) return false;

			const bool blended = (cmd & GPU_DRAW_BLENDED) != 0;
			render(GL_POINTS, (const uint16_t*) &write_fifo, 1, blended, false, false);
		}
		break ;
	case GPU_COMMAND_LINE:
		{
			const bool shaded = (cmd & GPU_DRAW_SHADED) != 0;
			const bool textured = (cmd & GPU_DRAW_TEXTURED) != 0;
			const bool poly = (cmd & GPU_DRAW_POLY) != 0;
			const bool blended = (cmd & GPU_DRAW_BLENDED) != 0;

			const int size = 2 +
				(shaded ? 2 : 1) +
				(textured ? 2 : 0);

			if (write_depth < size) return false;
			// TODO: POLY LINE HERE

			render(GL_LINE_STRIP, (const uint16_t*) &write_fifo, 2, blended, textured, shaded);
		}
		break ;
	case GPU_COMMAND_TRIANGLE:
		{
			const bool shaded = (cmd & GPU_DRAW_SHADED) != 0;
			const bool textured = (cmd & GPU_DRAW_TEXTURED) != 0;
			const bool blended = (cmd & GPU_DRAW_BLENDED) != 0;		

			const int size = 3 +
				(shaded ? 3 : 1) +
				(textured ? 3 : 0);

			if (write_depth < size) return false;

			render(GL_TRIANGLES, (const uint16_t*) &write_fifo, 3, blended, textured, shaded);
		}
 		break ;
	case GPU_COMMAND_QUAD:
		{
			const bool shaded = (cmd & GPU_DRAW_SHADED) != 0;
			const bool textured = (cmd & GPU_DRAW_TEXTURED) != 0;
			const bool blended = (cmd & GPU_DRAW_BLENDED) != 0;		

			const int size = 4 +
				(shaded ? 4 : 1) +
				(textured ? 4 : 0);

			if (write_depth < size) return false;
		
			render(GL_TRIANGLE_STRIP, (const uint16_t*) &write_fifo, 4, blended, textured, shaded);
		}
 		break ;
	}

	return true;
}

uint32_t GPU::read(uint32_t address) {
	switch (address & 1) {
	case 0x00000000: // FIFO READ
		return read_fifo[read_depth];
		if (read_depth < read_size) read_depth++;
		break ;
	case 0x00000001: // CONTROL REGISTER
		break ; 
	}

	return ~0;
}

void GPU::write(uint32_t address, uint32_t value, uint32_t mask) {
	switch (address & 1) {
	case 0x00000000: // FIFO WRITE
		if (write_depth < fifo_depth) {
			write_fifo[write_depth++] = value;
			if (process_fifo()) write_depth = 0;
		}
		break ;
	case 0x00000001: // CONTROL REGISTER
		break ; 
	}
}
