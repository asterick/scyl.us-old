#include <stdint.h>
#include <stddef.h>
#include <string.h>

#include "system.h"

#include "compiler.h"
#include "imports.h"
#include "consts.h"

#include "gpu.h"

uint32_t GPU::read(uint32_t) {
	return ~0;
}

void GPU::write(uint32_t, uint32_t, uint32_t) {

}
