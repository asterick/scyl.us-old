import {
    setBlend, setTexture, setClut, setDraw, setClip,
    setViewport, setDither, setMask, attach, render,
    getData, setData
} from "./renderer";

export { attach as attach };

// Initialization state
setViewport(0, 0, 256, 240);
setClip(0, 0, 256, 240);
setDraw(0, 0);
setTexture(0, 0);
setClut(false, 0, 0, 0);
setMask(true, false);
setDither(true);
setBlend(false, 0, 0, 0, 0);

export function read (page, code, logical, pc, delayed) {
    throw code ? Exceptions.BusErrorInstruction : Exceptions.BusErrorData;
}

export function write (address, value, mask = ~0) {
    throw Exceptions.BusErrorData;
}

/* This is a gross test bench to see if the GPU works
export function test () {
    setClut(true, 2, 0, 220);
    render(WebGL2RenderingContext.TRIANGLE_FAN, 0, 4, false, -1, new Int16Array([
        0,   0, 0b0000000000000001,
        0, 240, 0b0000000000111111,
      256, 240, 0b1111111111000001,
      256,   0, 0b1111100000000001,
    ]));

    const palette = new Uint16Array(16);
    for (var i = 0; i < palette.length; i++) palette[i] = ((i * 2) * 0x21) | (((i >> 2) ^ i) & 1 ? 0x8000 : 0);
    setData(0, 220, 16, 1, palette);

    const px = new Uint16Array([
        0x3210,
        0x7654,
        0xBA98,
        0xFEDC,
    ]);
    const px2 = new Uint16Array(4);
    setData(0, 0, 1, 4, px);
    getData(0, 0, 1, 4, px2);
    for (var i = 0; i < px.length; i++) if (px[i] != px2[i]) throw "getData / setData mismatch";

    setMask(false, true);
    setBlend(false, 1.0, 0.25, 0.25, 0.75);

    render(WebGL2RenderingContext.TRIANGLE_STRIP, 0, 4, true, 0b1111111111111111, new Int16Array([
        64,  64, 0, 0,
        64, 192, 0, 4,
       192,  64, 4, 0,
       192, 192, 4, 4,
    ]));

    render(WebGL2RenderingContext.POINTS, 0, 4, false, 0b1111111111111111, new Int16Array([
        96,  96,
        96, 160,
       160,  96,
       160, 160,
    ]));
}
//*/
