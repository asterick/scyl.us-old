/***
 TODO
 ====
 * Blend modes
 * Optimize vram -> shadow copy
 ***/

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

for (var i = 0; i < 0x10000; i++) {
	var r = (i >> 8) & 0xF8,
		g = (i >> 3) & 0xF8,
		b = (i << 2) & 0xF8,
		a = (i  & 1) ? 0xFF : 0;

	PALETTE[i] = (a << 24) | (b << 16) | (g << 8) | r;
}

export default class {
	constructor () {
		// SETUP DEFAULT REGIONS
		this.setViewport(64, 64, 256, 240);
		this.setClip(0, 0, 256, 240);
		this.setDraw(32, 32);
		this._textureX = 0;
		this._textureY = 0;
		this._clutX = 0;
		this._clutY = 220;
		this._clutMode = CLUT_4BPP;
		this._dither = true;
		this._masked = true;
		this._setMask = false;

		// Bind our function
		this._requestFrame = () => this._repaint();
		this._resize = () => this._onresize();
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
		this._leaveRender();
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
		this._vramFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._vram, 0);

		this._shadowFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
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

		// Render our shit
	   	gl.uniform1i(this._drawShader.uniforms.uTextured, textured);
	   	gl.uniform1i(this._drawShader.uniforms.uMasked, this._masked);
	   	gl.uniform1i(this._drawShader.uniforms.uSetMask, this._setMask);
	   	gl.uniform1i(this._drawShader.uniforms.uDither, this._dither);
	   	gl.uniform2i(this._drawShader.uniforms.uTextureOffset, this._textureX, this._textureY);
	   	gl.uniform1i(this._drawShader.uniforms.uClutMode, this._clutMode);
	   	gl.uniform2i(this._drawShader.uniforms.uClutOffset, this._clutX, this._clutY);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.DYNAMIC_DRAW);

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

		gl.drawArrays(type, 0, vertexes.buffer.byteLength / size);		
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, this._clipX, this._clipY, this._clipX, this._clipY, this._clipWidth, this._clipHeight);
	}

	getData (x, y, width, height, target) {
		const gl = this._gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.readPixels(x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);

		if (!this._isRendering) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}

		var t = 0;
		for (var i = 0; i < VRAM_WORDS.length; i++) {
			var r = (VRAM_WORDS[i]  <<  8) & 0xF800;
			var g = (VRAM_WORDS[i]  >>  5) & 0x07C0;
			var b = (VRAM_WORDS[i]  >> 18) & 0x003E;
			var a = (VRAM_WORDS[i] >>> 31) & 1;

			target[i] = r | g | b | a;
		}
	}

	setData (x, y, width, height, target) {
		const gl = this._gl;

		for (var i = 0; i < VRAM_WORDS.length; i++) {
			VRAM_WORDS[i] = PALETTE[target[i]];
		}

		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);

		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);

		gl.bindTexture(gl.TEXTURE_2D, this._isRendering ? this._shadow : this._vram);
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

		if (!gl) return ;

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

		gl.enableVertexAttribArray(this._drawShader.attributes.aVertex);

		// Setup our shadow frame
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.viewport(this._clipX, this._clipY, this._clipWidth, this._clipHeight);

		// Setup our program
		gl.useProgram(this._drawShader.program);

    	gl.uniform1i(this._drawShader.uniforms.sVram, 0);
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._shadow);

	   	gl.uniform2f(this._drawShader.uniforms.uDrawPos, this._drawX, this._drawY);
	   	gl.uniform2f(this._drawShader.uniforms.uClipPos, this._clipX, this._clipY);
	   	gl.uniform2f(this._drawShader.uniforms.uClipSize, this._clipWidth, this._clipHeight);
	}

	_leaveRender () {
		if (!this._isRendering) return ;
		this._isRendering = false;

		const gl = this._gl;

		gl.disableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.disableVertexAttribArray(this._drawShader.attributes.aColor);

		gl.enableVertexAttribArray(this._displayShader.attributes.aVertex);

		// ==== Setup program
		gl.useProgram(this._displayShader.program);
		gl.disable(gl.BLEND);

		// Setup for frame copy
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
    	gl.uniform1i(this._displayShader.uniforms.sVram, 0);
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
        for (var i = 0; i < palette.length; i++) palette[i] = ((i * 2) * 0x42) | (((i >> 2) ^ i) & 1);
        this.setData(this._clutX, this._clutY, 16, 1, palette);

        const px = new Uint16Array([
        	0x3210,
        	0x7654,
        	0xBA98,
        	0xFEDC,
    	]);
    	this.setData(0, 0, 1, 4, px);
    	this.getData(0, 0, 1, 4, px);

        this.render(gl.TRIANGLE_STRIP,  true, 0b1111111111111111, new Int16Array([
            64,  64, 0, 0,
            64, 192, 0, 4,
           192,  64, 4, 0,
           192, 192, 4, 4,
        ]));

        this.render(gl.POINTS, false, 0b1111111111111111, new Int16Array([
            96,  96,
            96, 160,
           160,  96,
           160, 160,
        ]));
	}
}
