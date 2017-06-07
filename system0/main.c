typedef unsigned int size_t;
typedef unsigned int uint32_t;

extern const uint32_t _DATA_ROM;
extern const uint32_t _DATA_START;
extern const uint32_t _DATA_SIZE;

volatile uint32_t DATA[] = {1,1,1,1,1,1,1,1,1};

void* memcpy(void* dest, const void* src, size_t n) {
	unsigned char *t = (unsigned char*) dest;
	unsigned char *s = (unsigned char*) src;

	while (n--) *(t++) = *(s++);
	return dest;
}

int main(void) {
	memcpy((void*)&_DATA_START, &_DATA_ROM, (uint32_t)&_DATA_SIZE);
	for (;;) ;
}
