import DisplayFragmentShader from "raw-loader!./shaders/display.fragment.glsl";
import DisplayVertexShader from "raw-loader!./shaders/display.vertex.glsl";
import DrawFragmentShader from "raw-loader!./shaders/draw.fragment.glsl";
import DrawVertexShader from "raw-loader!./shaders/draw.vertex.glsl";

const VRAM_WIDTH = 1024;
const VRAM_HEIGHT = 512;

const CLUT_16BPP = 0;
const CLUT_8BPP  = 1;
const CLUT_4BPP  = 2;

const PALETTE = new Uint32Array(0x10000);
const VRAM_WORDS = new Uint32Array(VRAM_WIDTH * VRAM_HEIGHT);
const VRAM_BYTES = new Uint8Array(VRAM_WORDS.buffer);

function pack(i) {
	var r = (i  >>  3) & 0x001F;
	var g = (i  >>  6) & 0x03E0;
	var b = (i  >>  9) & 0x7C00;
	var a = (i >>> 16) & 0x8000;

	return r | g | b | a;
}

function unpack(i) {
	var r = (i << 3) & 0xF8,
		g = (i << 6) & 0xF800,
		b = (i << 9) & 0xF80000,
		a = (i & 0x8000) ? 0xFF000000 : 0;

	return (a | b | g | r) >>> 0;
}

for (var i = 0; i < 0x10000; i++) {
	PALETTE[i] = unpack(i);
}

export default class {
	constructor () {
		// SETUP DEFAULT REGIONS
		this.setViewport(0, 0, 256, 240);
		this.setClip(0, 0, 256, 240);
		this.setDraw(0, 0);
		this.setTexture(0, 0);
		this.setClut(CLUT_4BPP, 0, 220);
		this.setMask(true, false);
		this.setDither(true);
		this.setBlend(false);

		this._dirty = false;

		// Bind our function
		this._requestFrame = () => this._repaint();
		this._resize = () => this._onresize();
	}

	setBlend(blend, setSrcCoff, setDstCoff, resetSrcCoff ,resetDstCoff) {
		this._blend = blend;
		this._setSrcCoff = setSrcCoff;
		this._setDstCoff = setDstCoff;
		this._resetSrcCoff = resetSrcCoff;
		this._resetDstCoff = resetDstCoff;
	}

	setTexture(x, y) {
		this._textureX = x;
		this._textureY = y;
	}

	setClut(mode, x, y) {
		this._clutMode = mode;
		this._clutX = x;
		this._clutY = y;
	}

	setDraw(x, y) {
		this._drawX = x;
		this._drawY = x;
	}

	setClip(x, y, width, height) {
		// This forces a copy back, and reconfigure the shader
		this._leaveRender();

		this._clipX = x;
		this._clipY = y;
		this._clipWidth = width;
		this._clipHeight = height;
	}

	setViewport (x, y, width, height) {
		this._viewX = x;
		this._viewY = y;
		this._viewWidth = width;
		this._viewHeight = height;
	}

	setDither (dither) {
		this._dither = dither;
	}

	setMask (masked, setMask) {
		this._masked = masked;
		this._setMask = setMask;
	}

	attach (canvas) {
		if (!canvas) {
			window.removeEventListener("resize", this._resize);
			window.cancelAnimationFrame(this._animationFrame);
			return ;
		}

		// Create our context
		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: true,
			depth: false,
			stencil: false
		});

		window.addEventListener("resize", this._resize);

		this._canvas = canvas;
		this._gl = gl;
		this._onresize();

		// Global enable / disables
		gl.disable(gl.STENCIL_TEST);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.DITHER);
		gl.colorMask(true, true, true, true);
		gl.clearColor(0, 0, 0, 1);

		// Setup or rendering programs
		this._displayShader = this._createShader (DisplayVertexShader, DisplayFragmentShader);
		this._drawShader = this._createShader (DrawVertexShader, DrawFragmentShader);

		// Setup our vertex buffers
		this._copyBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 1, 1, 1,-1,-1, 1,-1,-1]), gl.STATIC_DRAW);

		this._drawBuffer = gl.createBuffer();

		// Video memory
		this._vram = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		this._shadow = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		// Setup the draw targets
		this._framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._shadow, 0);

		// Set context to render by default
		this._enterRender();
		this._test();

		this._requestRepaint();
	}

	render (type, textured, color, vertexes) {
		const gl = this._gl;
		const flat = color >= 0;
		const size = 4 + (textured ? 4 : 0) + (flat ? 0 : 2);

		this._enterRender();
		this._requestRepaint();

		if (this._blend) {
			this._parityCopy();
		}

		// Drawing region
	   	gl.uniform2f(this._drawShader.uniforms.uDrawPos, this._drawX, this._drawY);

	   	// Texture settings
	   	gl.uniform1i(this._drawShader.uniforms.uTextured, textured);
	   	if (textured) {
		   	gl.uniform2i(this._drawShader.uniforms.uTextureOffset, this._textureX, this._textureY);
		   	gl.uniform1i(this._drawShader.uniforms.uClutMode, this._clutMode);
		   	gl.uniform2i(this._drawShader.uniforms.uClutOffset, this._clutX, this._clutY);
	   	}

	   	// Blending flags
		gl.uniform1i(this._drawShader.uniforms.uSemiTransparent, this._blend);
		if (this._blend) {
			gl.uniform2f(this._drawShader.uniforms.uSetCoff, this._setSrcCoff, this._setDstCoff);
			gl.uniform2f(this._drawShader.uniforms.uResetCoff, this._resetSrcCoff, this._resetDstCoff);
		}

	   	// Render flags
	   	gl.uniform1i(this._drawShader.uniforms.uMasked, this._masked);
	   	gl.uniform1i(this._drawShader.uniforms.uSetMask, this._setMask);
	   	gl.uniform1i(this._drawShader.uniforms.uDither, this._dither);

		// Buffer draw parameters
		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.DYNAMIC_DRAW);

		// Setup our vertex pointers
		gl.vertexAttribIPointer( this._drawShader.attributes.aVertex, 2, gl.SHORT, size, 0);

		if (textured) {
			gl.vertexAttribIPointer(this._drawShader.attributes.aTexture, 2, gl.SHORT, size, 4);
			gl.enableVertexAttribArray(this._drawShader.attributes.aTexture);
		} else {
			gl.vertexAttribI4i(this._drawShader.attributes.aTexture, 0, 0, 0, 0);
			gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		}

		if (flat) {
			gl.vertexAttribI4ui(this._drawShader.attributes.aColor, color, color, color, color);
			gl.disableVertexAttribArray(this._drawShader.attributes.aColor);
		} else {
			gl.vertexAttribIPointer(this._drawShader.attributes.aColor, 1, gl.UNSIGNED_SHORT, size, textured ? 8 : 4);
			gl.enableVertexAttribArray(this._drawShader.attributes.aColor);
		}

		// Draw array
		gl.drawArrays(type, 0, vertexes.buffer.byteLength / size);

		// Set our dirty flag so we know to copy the shadow frame over
		this._dirty = true;
	}

	_parityCopy() {
		if (!this._dirty) return ;

		const gl = this._gl;
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, this._clipX, this._clipY, this._clipX, this._clipY, this._clipWidth, this._clipHeight);

		this._dirty = false;
	}

	getData (x, y, width, height, target) {
		const gl = this._gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
		gl.readPixels(x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);

		if (!this._isRendering) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		for (var i = 0; i < VRAM_WORDS.length; i++) {
			target[i] = pack(VRAM_WORDS[i]);
		}
	}

	setData (x, y, width, height, target) {
		const gl = this._gl;

		for (var i = 0; i < VRAM_WORDS.length; i++) {
			VRAM_WORDS[i] = PALETTE[target[i]];
		}

		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);

		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);
	}

	_onresize () {
		// Lookup the size the browser is displaying the canvas.
		this._viewportWidth = this._canvas.clientWidth;
		this._viewportHeight = this._canvas.clientHeight;

		// Make the canvas the same size
		this._canvas.width  = this._viewportWidth;
		this._canvas.height = this._viewportHeight;

		this._aspectRatio = (this._viewportHeight / this._viewportWidth) * (4 / 3);

		this._requestRepaint();
	}

	_requestRepaint() {
		if (this._animationFrame) {
			return ;
		}

		this._animationFrame = window.requestAnimationFrame(this._requestFrame);
	}

	_repaint () {
		const gl = this._gl;

		this._leaveRender();

		// Copy our viewport to the screen
		gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

	   	gl.uniform1f(this._displayShader.uniforms.uAspectRatio, this._aspectRatio);
	   	gl.uniform2f(this._displayShader.uniforms.uViewportSize, this._viewWidth, this._viewHeight);
	   	gl.uniform2f(this._displayShader.uniforms.uViewportPosition, this._viewX, this._viewY);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyBuffer);
		gl.vertexAttribPointer(this._displayShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		this._animationFrame = 0;
	}

	_enterRender () {
		if (this._isRendering) return ;
		this._isRendering = true;

		const gl = this._gl;

		gl.disableVertexAttribArray(this._displayShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._drawShader.attributes.aVertex);

		// Setup our shadow frame
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

		// Setup our program
		gl.useProgram(this._drawShader.program);

    	// Select vram as TEXTURE0
    	gl.uniform1i(this._drawShader.uniforms.sVram, 0);

    	// Setup clipping rectangle
		gl.viewport(this._clipX, this._clipY, this._clipWidth, this._clipHeight);
	   	gl.uniform2f(this._drawShader.uniforms.uClipPos, this._clipX, this._clipY);
	   	gl.uniform2f(this._drawShader.uniforms.uClipSize, this._clipWidth, this._clipHeight);

		// Select the new frame buffer / vram
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
    	
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
    	gl.uniform1i(this._drawShader.uniforms.sVram, 0);
	}

	_leaveRender () {
		if (!this._isRendering) return ;
		this._isRendering = false;

		const gl = this._gl;

		// Copy render buffer to target
		this._parityCopy();

		// Change our attributes
		gl.disableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.disableVertexAttribArray(this._drawShader.attributes.aColor);
		gl.enableVertexAttribArray(this._displayShader.attributes.aVertex);

		// ==== Setup program
		gl.useProgram(this._displayShader.program);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
    	gl.uniform1i(this._displayShader.uniforms.sVram, 0);

		// Set to render to display
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	_createShader (vertex, fragment) {
		const gl = this._gl;

		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		var vertexShader =  gl.createShader(gl.VERTEX_SHADER);

		gl.shaderSource(vertexShader, vertex);
		gl.compileShader(vertexShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(vertexShader));
			return null;
		}

		gl.shaderSource(fragmentShader, fragment);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			console.error(gl.getShaderInfoLog(fragmentShader));
			return null;
		}

		let shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error(gl.getError());
			return null;
		}

		const attrCount = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
		const attributes = {};

		for (var i = 0; i < attrCount; i++) {
			const attr = gl.getActiveAttrib(shaderProgram, i);
			attributes[attr.name] = i;
		}

		const uniCount= gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
		const uniforms = {};

		for (var i = 0; i < uniCount; i++) {
			const uni = gl.getActiveUniform(shaderProgram, i);
			uniforms[uni.name] = gl.getUniformLocation(shaderProgram, uni.name);
		}

		return {
			attributes: attributes,
			uniforms: uniforms,
			program: shaderProgram
		}
	}

	// THIS IS MY GROSS TEST BENCH
	_test () {
		const gl = this._gl;

        this.render(gl.TRIANGLE_FAN, false, -1, new Int16Array([
            0,   0, 0b0000000000000001,
            0, 240, 0b0000011111000001,
          256, 240, 0b1111111111000001,
          256,   0, 0b1111100000000001,
        ]));

        const palette = new Uint16Array(16);
        for (var i = 0; i < palette.length; i++) palette[i] = ((i * 2) * 0x21) | (((i >> 2) ^ i) & 1 ? 0x8000 : 0);
        this.setData(this._clutX, this._clutY, 16, 1, palette);

        const px = new Uint16Array([
        	0x3210,
        	0x7654,
        	0xBA98,
        	0xFEDC,
    	]);
    	this.setData(0, 0, 1, 4, px);
    	this.getData(0, 0, 1, 4, px);
    	for (var i = 0; i < px.length; i++) console.log(px[i].toString(16))

		this.setMask(false, true);
		this.setBlend(true, 1.0, 0.25, 0.25, 0.75);

        this.render(gl.TRIANGLE_STRIP,  true, 0b1111111111111111, new Int16Array([
            64,  64, 0, 0,
            64, 192, 0, 4,
           192,  64, 4, 0,
           192, 192, 4, 4,
        ]));

		this.setBlend(false, 2.0, 1.0, 0.25, 0.75);
		this.setDither(false);

        this.render(gl.POINTS, false, 0b1111111111111111, new Int16Array([
            96,  96,
            96, 160,
           160,  96,
           160, 160,
        ]));
	}
}
