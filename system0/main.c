typedef unsigned int size_t;
typedef unsigned int uint32_t;

extern const uint32_t _DATA_START;
extern const uint32_t _DATA_TARGET;
extern const uint32_t _DATA_SIZE;

unsigned char DATA[] = {1,2,3,4,5,6,7,8,9};

void* memcpy(void* dest, const void* src, size_t n) {
	unsigned char *t = (unsigned char*) dest;
	unsigned char *s = (unsigned char*) src;

	while (n-- > 0) *(t++) = *(s++);
	return dest;
}

int main(void) {
	//volatile int a = (int)_DATA_TARGET;
	memcpy(&_DATA_TARGET, &_DATA_START, (uint32_t)&_DATA_SIZE);
	for (;;) ;
}
