#pragma once

namespace HART {
	void reset();
	void interrupt(SystemIRQ irq);
	void handle_interrupt();
}
