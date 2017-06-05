extern const void* const _DATA_START;
extern void* const _DATA_TARGET;
extern const unsigned int _DATA_SIZE;

typedef unsigned int size_t;

void* memcpy(void* dest, const void* src, size_t n) {
	unsigned char *t = (unsigned char*) dest;
	unsigned char *s = (unsigned char*) src;

	while (n-- > 0) *(t++) = *(s++);
	return dest;
}

int main(void) {
	memcpy(_DATA_TARGET, _DATA_START, _DATA_SIZE);
	for (;;) ;
}
