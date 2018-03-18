typedef unsigned int size_t;
typedef unsigned int uint32_t;

volatile uint32_t DATA[] = {
	0xDEADFACE,
	0xCAFEBABE,
	0x01234567
};

void* memcpy(void* dest, const void* src, size_t n) {
	unsigned char *t = (unsigned char*) dest;
	unsigned char *s = (unsigned char*) src;

	while (n--) *(t++) = *(s++);
	return dest;
}

int main(void) {
}
