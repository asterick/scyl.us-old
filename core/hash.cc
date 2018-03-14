#include <stdint.h>

#include "compiler.h"
#include "fields.h"
#include "consts.h"
#include "hash.h"

#include "imports.h"

static const int MAX_UNIQUE_HASH = 64;
static const int PAGE_SIZE = 0x10000;

typedef struct {
	int used;
	uint32_t values[PAGE_SIZE];
} HashPage;

static HashPage* NULL = (HashPage *) 0;

static HashPage* top_block[PAGE_SIZE];
static HashPage base_block[MAX_UNIQUE_HASH];

void Hash::reset() {
	for (int i = 0; i < PAGE_SIZE; i++) {
		top_block[i] = NULL;
	}
}

uint32_t Hash::find(uint32_t index) {
	uint32_t hash_top = index >> 16;
	HashPage* block = top_block[hash_top];

	if (block == NULL) return 0;

	uint32_t hash_bottom = index & 0xFFFF;

	return block->values[hash_bottom];
}

void Hash::clear(uint32_t index) {
	uint32_t hash_top = index >> 16;

	HashPage* block = top_block[hash_top];

	if (block == NULL) {
		return ;
	}

	uint32_t hash_bottom = index & 0xFFFF;

	// Value is unset
	if (block->values[hash_bottom] == 0) {
		return ;
	}

	block->values[hash_bottom] = 0;

	if (--block->used <= 0) {
		top_block[hash_top] = NULL;
	}
}

void Hash::write(uint32_t index, uint32_t value) {
	// Zero is implicitly a cleared value
	if (value == 0) {
		Hash::clear(index);
		return ;
	}

	// Locate top block, allocating if nessessary
	uint32_t hash_top = index >> 16;
	HashPage* block = top_block[hash_top];

	if (block == NULL) {
		for (int i = 0; i < MAX_UNIQUE_HASH; i++) {
			block = &base_block[i];

			if (block->used <= 0) {
				top_block[hash_top] = block;
				break ;
			}
		}
	}

	uint32_t hash_bottom = index & 0xFFFF;

	if (block->values[hash_bottom] != 0) {
		block->used++;
	}

	block->values[hash_bottom] = value;
}
