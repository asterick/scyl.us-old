int main(void) {
	volatile unsigned int* a = (volatile unsigned int*)0xB0000000;
	for (;;) (*a)++;
}

