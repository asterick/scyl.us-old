typedef unsigned int size_t;
typedef unsigned int uint32_t;

extern const uint32_t _DATA_ROM;
extern const uint32_t _DATA_START;
extern const uint32_t _DATA_SIZE;

unsigned char DATA[] = {1,2,3,4,5,6,7,8,9};

void* memcpy(void* dest, const void* src, size_t n) {
	unsigned char *t = (unsigned char*) dest;
	unsigned char *s = (unsigned char*) src;

	while (n--) *(t++) = *(s++);
	return dest;
}

int main(void) {
	memcpy(&_DATA_START, &_DATA_ROM, (uint32_t)&_DATA_SIZE);
	for (;;) ;
}
