#include <stdint.h>

uint32_t pack(uint32_t value1, uint32_t value2) {
    return (value1 << 16)  + value2;
}
uint32_t* unpack(uint32_t value) {
    static uint32_t unpacked[2];
    unpacked[0] = value >> 16;
    unpacked[1] = value - (unpacked[0] << 16);
    
    return unpacked;
}
