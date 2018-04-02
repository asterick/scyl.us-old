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

enum GPUMode {
	GPU_MODE_IDLE,
	GPU_MODE_WAITING,
	GPU_MODE_SET_DATA,
	GPU_MODE_GET_DATA,
	GPU_MODE_RENDERING
};

static const float blend_coffs[] = {
	 1.000f,  0.500f,  0.250f,  0.125f,  0.000f,  0.500f,  0.750f,  0.875f,
	-1.000f, -0.500f, -0.250f, -0.125f, -0.000f, -0.500f, -0.750f, -0.875f
};

static const int fifo_depth = 1024;

GPUMode mode = GPU_MODE_IDLE;

static uint32_t vram_data[VRAM_WIDTH * VRAM_HEIGHT];
static uint32_t vram_index = 0;
static uint32_t vram_size;

static uint32_t fifo[fifo_depth];
static uint32_t fifo_write_index = 0;
static uint32_t fifo_read_index = 0;
static uint32_t fifo_size = 0;
static uint32_t cr = 0;

static uint32_t delay_timer = 0;

static inline uint32_t read_fifo() {
	uint32_t data = fifo[fifo_read_index];
	fifo_read_index = (fifo_read_index + 1) % fifo_depth;
	fifo_size--;

	return data;
}

static int calc_tri_size(int size, const uint16_t* data) {
	int x[3], y[3];

	for (int i = 0; i < 3; i++) {
		x[i] = data[0]; y[i] = data[1];
		data += size;
	}

	int total = 
		x[0]*(y[1]-y[2]) +
		x[1]*(y[2]-y[0]) +
		x[2]*(y[0]-y[1]);

	return ((total < 0) ? -total : total) / 2;
}

static int calc_clocks(int count, int size, const uint16_t* vertexes) {
	switch (count) {
		case 1: return 1;
		case 2: {
			int x = vertexes[0] - vertexes[size];
			int y = vertexes[1] - vertexes[size+1];
			
			if (x < 0) x = -x;
			if (y < 0) y = -y;

			return (x < y) ? y : x;
		}
		case 3:
			return calc_tri_size(size, vertexes);
		case 4:
			return calc_tri_size(size, vertexes) + calc_tri_size(size, &vertexes[size]);
	}
	return 0;
}

static void process_fifo() {
	static uint32_t cmd, width, height, x, y;
	static bool shaded, textured, poly, blended;
	static uint32_t vertexes[12];
	static int vertex_index;
	static int vertex_count;
	static int vertex_size;
	static int vertex_fill;
	static int vertex_end;
	static int fill_clock;
	static bool paletted;
	static bool vertex_reset;
	static GLenum prim_type;

	while (fifo_size > 0) {
		switch (mode) {
			case GPU_MODE_RENDERING:
				{
					uint32_t data = read_fifo();

					// Poly fill mode
					if (data & 0x80000000) {
						mode = GPU_MODE_IDLE;
						continue ;
					} else {
						mode = GPU_MODE_RENDERING;
					}

					vertexes[vertex_index++] = data;

					// until we've filled an entire vertex buffer
					if (--vertex_fill > 0) continue ;

					render(prim_type, (uint16_t*)vertexes, vertex_count, blended, textured, shaded);
					
					delay_timer += calc_clocks(vertex_count, vertex_size * 2, (const uint16_t*)&vertexes[1]) * fill_clock;

					if (poly) {
						if (vertex_index >= vertex_end) vertex_index = shaded ? 0 : 1;
						vertex_fill = vertex_size;
						vertex_reset = true;
					} else {
						mode = GPU_MODE_IDLE;
					}
				}

				continue ;
			case GPU_MODE_GET_DATA:
				return ;
			case GPU_MODE_IDLE:
				mode = GPU_MODE_WAITING;
				cmd = read_fifo();
			case GPU_MODE_WAITING:
				break ;
			case GPU_MODE_SET_DATA:
				while (vram_index < width * height) {
					if (fifo_size <= 0) return ;

					uint32_t i = read_fifo();

					// Lower word
					{
						uint32_t r = (i <<  3) & 0x000000F8;
						uint32_t g = (i <<  6) & 0x0000F800;
						uint32_t b = (i <<  9) & 0x00F80000;
						uint32_t a = (i << 16) & 0x80000000;
						
						vram_data[vram_index++] = r | g | b | a;
					}

					// Upper word
					{
						uint32_t r = (i >> 13) & 0x000000F8;
						uint32_t g = (i >> 10) & 0x0000F800;
						uint32_t b = (i >>  7) & 0x00F80000;
						uint32_t a = (i      ) & 0x80000000;
						
						vram_data[vram_index++] = r | g | b | a;
					}
				}
				
				set_vram_data(x, y, width, height, vram_data);
				mode = GPU_MODE_IDLE;
				continue ;
		}

		// Process command
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

				paletted = mode < 4;

				set_clut(mode, x, y);
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
	 	case GPU_SETDATA_COMMAND:
	 		{
	 			if (fifo_size <= 0) return ;	// Wait for parameter

				const uint32_t param = read_fifo();

				width = ((cmd & GPU_GETDATA_WIDTH_MASK) >> GPU_GETDATA_WIDTH_SHIFT);
				height = (cmd & GPU_GETDATA_HEIGHT_MASK) >> GPU_GETDATA_HEIGHT_SHIFT;
				x = (param & GPU_POINT_X_MASK) >> GPU_POINT_X_SHIFT;
				y = (param & GPU_POINT_Y_MASK) >> GPU_POINT_Y_SHIFT;
	 			vram_index = 0;

	 			mode = GPU_MODE_SET_DATA;
		 		continue ;
			}
	 	case GPU_GETDATA_COMMAND:
	 		{
	 			if (fifo_size <= 0) return ;	// Wait for parameter

				const uint32_t param = read_fifo();

				const uint32_t width = (cmd & GPU_GETDATA_WIDTH_MASK) >> GPU_GETDATA_WIDTH_SHIFT;
				const uint32_t height = (cmd & GPU_GETDATA_HEIGHT_MASK) >> GPU_GETDATA_HEIGHT_SHIFT;
				const uint32_t x = (param & GPU_POINT_X_MASK) >> GPU_POINT_X_SHIFT;
				const uint32_t y = (param & GPU_POINT_Y_MASK) >> GPU_POINT_Y_SHIFT;

				get_vram_data(x, y, width, height, vram_data);
				
				int words = width * height;
				const uint32_t* source = vram_data;
				uint16_t* target = (uint16_t*) vram_data;

				while (words-- > 0) {
					uint32_t i = *(source++);
					uint16_t r = (i & 0x000000F8) >>  3;
					uint16_t g = (i & 0x0000F800) >>  6;
					uint16_t b = (i & 0x00F80000) >>  9;
					uint16_t a = (i & 0x80000000) >> 16;
					*(target++) = r | g | b | a;
				}

				vram_index = 0;
				vram_size = (width * height + 1) / 2;
	 			mode = GPU_MODE_GET_DATA;
		 		return ;
			}
		case GPU_COMMAND_POINT:
		case GPU_COMMAND_LINE:
		case GPU_COMMAND_TRIANGLE:
		case GPU_COMMAND_QUAD:
			shaded = (cmd & GPU_DRAW_SHADED) != 0;
			textured = (cmd & GPU_DRAW_TEXTURED) != 0;
			poly = (cmd & GPU_DRAW_POLY) != 0;
			blended = (cmd & GPU_DRAW_BLENDED) != 0;

			switch (cmd & 0xF0000000) {
				case GPU_COMMAND_POINT:
					prim_type = GL_POINTS;
					vertex_count = 1;
					break ;
				case GPU_COMMAND_LINE:
					prim_type = GL_LINE_STRIP;
					vertex_count = 2;
					break ;
				case GPU_COMMAND_TRIANGLE:
					prim_type = GL_TRIANGLE_STRIP;
					vertex_count = 3;
					break ;
				case GPU_COMMAND_QUAD:
					prim_type = GL_TRIANGLE_STRIP;
					vertex_count = 4;
					break ;
			}

			mode = GPU_MODE_RENDERING;
		
			vertexes[0] = cmd;
			vertex_index = 1;
			vertex_size = 1 +
				(shaded ? 1 : 0) +
				(textured ? 1 : 0);
			vertex_end = vertex_count +
				(shaded ? vertex_count : 1) +
				(textured ? vertex_count : 0);
			vertex_fill = vertex_end - 1;

			// Time it takes for the system to fill one pixel on the screen
			fill_clock = 1 +
				(textured ? 1 : 0) +
				(paletted ? 1 : 0) +
				(shaded ? 1 : 0) +
				(blended ? 1 : 0);

	 		continue ;
		}

		mode = GPU_MODE_IDLE;
	}
}

bool GPU::rx_full() {
	return fifo_size >= fifo_depth;
}

bool GPU::tx_empty() {
	return mode != GPU_MODE_GET_DATA;
}

uint32_t GPU::read(uint32_t address) {
	switch (address & 1) {
	case 0x00000000: // FIFO READ
		{
			uint32_t data = vram_data[vram_index];

			if (mode == GPU_MODE_GET_DATA) {
				if (--vram_size == 0) mode = GPU_MODE_IDLE;
				else ++vram_index;
			}

			return data;
		}
		break ;
	case 0x00000001: // CONTROL REGISTER
		return cr |
			(tx_empty() ? GPU_CR_TX_EMPTY : 0) |
			(rx_full() ? GPU_CR_RX_FULL : 0) |
			(mode != GPU_MODE_IDLE ? GPU_CR_BUSY : 0);
		break ; 
	}

	return ~0;
}

void GPU::write(uint32_t address, uint32_t value, uint32_t mask) {
	switch (address & 1) {
	case 0x00000000: // FIFO WRITE
		if (fifo_size < fifo_depth) {
			fifo[fifo_write_index] = value;
			fifo_write_index = (fifo_write_index + 1) % fifo_depth;
			fifo_size++;

			process_fifo();
		}
		break ;
	case 0x00000001: // CONTROL REGISTER
		if (value & GPU_CR_RESET) {
			fifo_write_index = 0;
			fifo_read_index = 0;
			fifo_size = 0;
			mode = GPU_MODE_IDLE;
		}

		cr = value & GPU_CR_VIDEOMODE_MASK;
		switch((cr & GPU_CR_VIDEOMODE_MASK) >> GPU_CR_VIDEOMODE_SHIFT) {
		case GPU_CR_VIDEOMODE_256_240:
			set_viewport_size(256, 240);
			break ;
		case GPU_CR_VIDEOMODE_320_240:
			set_viewport_size(320, 240);
			break ;
		case GPU_CR_VIDEOMODE_512_240:
			set_viewport_size(512, 240);
			break ;
		case GPU_CR_VIDEOMODE_640_240:
			set_viewport_size(640, 240);
			break ;
		case GPU_CR_VIDEOMODE_256_480:
			set_viewport_size(256, 480);
			break ;
		case GPU_CR_VIDEOMODE_320_480:
			set_viewport_size(320, 480);
			break ;
		case GPU_CR_VIDEOMODE_512_480:
			set_viewport_size(512, 480);
			break ;
		case GPU_CR_VIDEOMODE_640_480:
			set_viewport_size(640, 480);
			break ;
		}

		break ; 
	}
}
