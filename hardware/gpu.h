#pragma once

#define GPU_COLOR(r,g,b)					(((r << 16) & 0xFF0000)|((g << 8) & 0xFF00)|(b & 0xFF))
#define GPU_POINT(x, y)						(((y << 16) & 0xFFFF)|(x & 0xFFFF))

// Configure masking and texture 'size'
#define GPU_TEXSIZE_MASK_X_SHIFT				0
#define GPU_TEXSIZE_MASK_X_MASK					0x00001F
#define GPU_TEXSIZE_MASK_Y_SHIFT				5
#define GPU_TEXSIZE_MASK_Y_MASK					0x0003E0
#define GPU_TEXSIZE_OFF_X_SHIFT					10
#define GPU_TEXSIZE_OFF_X_MASK					0x007C00
#define GPU_TEXSIZE_OFF_Y_SHIFT					15
#define GPU_TEXSIZE_OFF_Y_MASK					0x0F8000

#define GPU_TEXSIZE(maskx, masky, offx, offy)	(0x10000000 | \
	((maskx << GPU_TEXSIZE_MASK_X_SHIFT) & GPU_TEXSIZE_MASK_X_MASK) | \
 	((masky << GPU_TEXSIZE_MASK_Y_SHIFT) & GPU_TEXSIZE_MASK_Y_MASK) | \
 	((offx << GPU_TEXSIZE_OFF_X_SHIFT) & GPU_TEXSIZE_OFF_X_MASK) | \
 	((offy << GPU_TEXSIZE_OFF_Y_SHIFT) & GPU_TEXSIZE_OFF_Y_MASK))

// Configuring mask, dither and blending
#define GPU_DRAWCONFIG_DITHER					0x00800000
#define GPU_DRAWCONFIG_SETMASK					0x00400000
#define GPU_DRAWCONFIG_USEMASK					0x00200000
#define GPU_DRAWCONFIG_SET_SRC_MASK				0x0000F000
#define GPU_DRAWCONFIG_SET_SRC_SHIFT			0
#define GPU_DRAWCONFIG_SET_DST_MASK				0x00000F00
#define GPU_DRAWCONFIG_SET_DST_SHIFT			4
#define GPU_DRAWCONFIG_RESET_SRC_MASK			0x000000F0
#define GPU_DRAWCONFIG_RESET_SRC_SHIFT			8
#define GPU_DRAWCONFIG_RESET_DST_MASK			0x0000000F
#define GPU_DRAWCONFIG_RESET_DST_SHIFT			12

enum GPUDrawConfig_Coff {
	GPU_DRAWCONFIG_POS_1_000,
	GPU_DRAWCONFIG_POS_0_500,
	GPU_DRAWCONFIG_POS_0_250,
	GPU_DRAWCONFIG_POS_0_125,
	GPU_DRAWCONFIG_POS_0_000,
	GPU_DRAWCONFIG_POS_0_500_REDUNDANT,	// Side effect
	GPU_DRAWCONFIG_POS_0_750,
	GPU_DRAWCONFIG_POS_0_875,
	GPU_DRAWCONFIG_NEG_1_000,
	GPU_DRAWCONFIG_NEG_0_500,
	GPU_DRAWCONFIG_NEG_0_250,
	GPU_DRAWCONFIG_NEG_0_125,
	GPU_DRAWCONFIG_NEG_0_000,
	GPU_DRAWCONFIG_NEG_0_500_REDUNDANT,	// Side effect
	GPU_DRAWCONFIG_NEG_0_750,
	GPU_DRAWCONFIG_NEG_0_875,
};

#define GPU_DRAWCONFIG(a,b,c,d)					(0x11000000 | \
		((a << GPU_DRAWCONFIG_SET_SRC_SHIFT) & GPU_DRAWCONFIG_SET_SRC_MASK) | \
		((b << GPU_DRAWCONFIG_SET_DST_SHIFT) & GPU_DRAWCONFIG_SET_DST_MASK) | \
		((c << GPU_DRAWCONFIG_RESET_SRC_SHIFT) & GPU_DRAWCONFIG_RESET_SRC_MASK) | \
		((d << GPU_DRAWCONFIG_RESET_DST_SHIFT) & GPU_DRAWCONFIG_RESET_DST_MASK))

// CLUT Settings
enum GPUClut_Mode {
	GPU_CLUT_1BPP = 0x000000,
	GPU_CLUT_2BPP = 0x100000,
	GPU_CLUT_4BPP = 0x200000,
	GPU_CLUT_8BPP = 0x300000,
	GPU_CLUT_DISABLED = 0xF00000
};

#define GPU_CLUT(mode, x, y)					(0x12000000 | \
		(mode) | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

// Positions
#define GPU_TEXPOS(x, y)						(0x14000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

#define GPU_DRAWPOS(x, y)						(0x15000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

#define GPU_CLIPPOS(x, y)						(0x16000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

#define GPU_CLIPSIZE(x, y)						(0x17000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

#define GPU_VIEWSTART(x, y)						(0x18000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 ))

#define GPU_GET_DATA(x, y, width, height) 		(0x20000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 )), \
		GPU_POINT(width, height)

#define GPU_SET_DATA(x, y, width, height) 		(0x21000000 | \
		((x & 0x3FF) << 0) | \
		((y & 0x3FF) << 10 )), \
		GPU_POINT(width, height)

// Drawing commands
#define GPU_COMMAND_POINT						0xC0000000
#define GPU_COMMAND_LINE						0xD0000000
#define GPU_COMMAND_TRIANGLE 					0xE0000000
#define GPU_COMMAND_QUAD 						0xF0000000
#define GPU_DRAW_SHADED							0x08000000
#define GPU_DRAW_TEXTURED						0x04000000
#define GPU_DRAW_POLY							0x02000000
#define GPU_DRAW_BLENDED						0x01000000

typedef struct {
   uint32_t fifo;
   uint32_t configure;
} GPURegisters;

static volatile GPURegisters* const GPU_Registers = (GPURegisters*) (GPU_BASE + KERNEL_UNMAPPED);
