//extern const unsigned int _DATA_START;
volatile unsigned int b;

int main(void) {
	volatile unsigned int* a = (volatile unsigned int*)0xB0000000;
	for (;;) { *a = (*a)++; b++; }
}
