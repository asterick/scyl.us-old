macro_rules! opcode {
    ($word:ident) => (($word >> 26) & 0b111111)
}

macro_rules! funct {
    ($word:ident) => ($word & 0b111111)
}

macro_rules! shamt {
    ($word:ident) => (($word >> 6) & 0b11111)
}

macro_rules! rd {
    ($word:ident) => (($word >> 11) & 0b11111)
}

macro_rules! rt {
    ($word:ident) => (($word >> 16) & 0b11111)
}

macro_rules! rs {
    ($word:ident) => (($word >> 21) & 0b11111)
}

macro_rules! imm16 {
    ($word:ident) => ($word & 0xffff)
}

macro_rules! simm16 {
    ($word:ident) => ((($word as isize) << 16) >> 16)
}

macro_rules! imm20 {
    ($word:ident) => (($word >> 6) & 0xfffff)
}

macro_rules! imm25 {
    ($word:ident) => ($word & 0x1ffffff)
}

macro_rules! imm26 {
    ($word:ident) => ($word & 0x3ffffff)
}

macro_rules! cop {
    ($word:ident) => (($word >> 26) & 3)
}
