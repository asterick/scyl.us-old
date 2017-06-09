/***
 TODO
 ====
 * Blend / Mask modes
 * Rendering primitives
 ***/

import CopyFragmentShader from "raw-loader!./shaders/copy.fragment.glsl";
import CopyVertexShader from "raw-loader!./shaders/copy.vertex.glsl";
import DrawFragmentShader from "raw-loader!./shaders/draw.fragment.glsl";
import DrawVertexShader from "raw-loader!./shaders/draw.vertex.glsl";

const VRAM_WIDTH = 1024;
const VRAM_HEIGHT = 512;

export default class {
	constructor () {
		// SETUP DEFAULT REGIONS
		this.setViewport(0, 0, 256, 240);
		this.setDraw(0, 0, 256, 240);
		this._textureX = 0;
		this._textureY = 0;
		this._clutX = 0;
		this._clutY = 220;
		this._clutMode = 2;
		this._dither = true;

		this._requestFrame = () => this._repaint();
	}

	attach (canvas) {
		if (!canvas) {
			window.cancelAnimationFrame(this._animationFrame);
			return ;
		}

		// Create our context
		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false
		});

		this._canvas = canvas;
		this._gl = gl;
		this.resize();

		// Global enable / disables
		gl.disable(gl.STENCIL_TEST);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.DITHER);
		gl.colorMask(true, true, true, true);
		gl.clearColor(0, 0, 0, 1);

		// Setup or rendering programs
		this._copyShader = this._createShader (CopyVertexShader, CopyFragmentShader);
		this._drawShader = this._createShader (DrawVertexShader, DrawFragmentShader);

		// Setup our vertex buffers
		this._copyXY = gl.createBuffer();
		this._copyUV = gl.createBuffer();
		this._drawBuffer = gl.createBuffer();

		// Video memory
		const vram = new Uint16Array(VRAM_WIDTH*VRAM_HEIGHT);
		const shadow = new Uint8Array(VRAM_WIDTH*VRAM_HEIGHT*4);

		this._vram = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB5_A1, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, vram);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		this._shadow = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, shadow);
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
		this._enterRender(true);
		this._test();

		this._requestRepaint();
	}

	_test () {
		const gl = this._gl;

        this._render(new Int16Array([
            0,   0, 0b0000000000000001,
            0, 240, 0b0000011111000001,
          256, 240, 0b1111111111000001,
          256,   0, 0b1111100000000001,
        ]), gl.TRIANGLE_FAN, false, false);

        const palette = new Uint16Array(16);
        for (var i = 0; i < palette.length; i++) palette[i] = ((i * 2) * 0x42) | 1
        this.setData(this._clutX, this._clutY, 16, 1, palette);

        const px = new Uint16Array([
        	0x3210, 0x3210,
        	0x7654, 0x7654,
        	0xBA98, 0xBA98,
        	0xFEDC, 0xFEDC,
    	]);
    	this.setData(0, 0,  1, 4, px);

        this._render(new Int16Array([
            64,  64, 0, 0,
            64, 192, 0, 4,
           192, 192, 4, 4,
           192,  64, 4, 0,
        ]), gl.TRIANGLE_FAN, false,  true, 0b1111111111111111);

		this._enterRender();
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

	setDraw(x, y, width, height) {
		this._leaveRender();

		this._drawX = x;
		this._drawY = y;
		this._drawWidth = width;
		this._drawHeight = height;
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

	// NOTE: DATA WILL BE 32-BIT WORD ALIGNED ON THE LINE BOUNDARY
	getData (x, y, width, height, target) {
		this._leaveRender();

		const gl = this._gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, target);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	// NOTE: DATA WILL BE 32-BIT WORD ALIGNED ON THE LINE BOUNDARY
	setData (x, y, width, height, target) {
		this._leaveRender();

		const gl = this._gl;

		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, target);
	}

	resize () {
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

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyXY);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1*this._aspectRatio,  1,
			-1*this._aspectRatio, -1,
			 1*this._aspectRatio, -1,
			 1*this._aspectRatio,  1,
		]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			this._viewX, this._viewY,
			this._viewX, this._viewY + this._viewHeight,
			this._viewX + this._viewWidth, this._viewY + this._viewHeight,
			this._viewX + this._viewWidth, this._viewY,
		]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexture, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

		this._animationFrame = 0;
	}

	_setBlend () {
    	// TODO: ACTUAL BLEND VALUES HERE
		/*
			gl.enable(gl.BLEND);
			gl.blendColor(0.5, 0.5, 0.5, 0.25);
			gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
			gl.blendFuncSeparate(gl.CONSTANT_COLOR, gl.CONSTANT_COLOR, gl.ONE, gl.ZERO);
		*/
	}

	_render (vertexes, type, masked, textured, color = -1) {
		const gl = this._gl;
		const flat = color >= 0;
		const size = 4 + (textured ? 4 : 0) + (flat ? 0 : 2);

		this._enterRender();
		this._requestRepaint();

		// Render our shit
	   	gl.uniform1i(this._drawShader.uniforms.uTextured, textured);
	   	gl.uniform1i(this._drawShader.uniforms.uMasked, masked);
	   	gl.uniform2i(this._drawShader.uniforms.uTextureOffset, this._textureX, this._textureY);
	   	gl.uniform1i(this._drawShader.uniforms.uClutMode, this._clutMode);
	   	gl.uniform2i(this._drawShader.uniforms.uClutOffset, this._clutX, this._clutY);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.DYNAMIC_DRAW);

		console.log(size);
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
	}

	_enterRender (force) {
		if (!force && this._isRendering) return ;
		this._isRendering = true;

		const gl = this._gl;

		this._shadowCopy(this._shadowFrame, this._vram, false);

		gl.disableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._copyShader.attributes.aTexture);

		gl.enableVertexAttribArray(this._drawShader.attributes.aVertex);

		// Setup our shadow frame
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

		// Setup our program
		gl.useProgram(this._drawShader.program);
		this._setBlend();

    	gl.uniform1i(this._drawShader.uniforms.sVram, 0);
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);

	   	gl.uniform2f(this._drawShader.uniforms.uDrawPos, this._drawX, this._drawY);
	   	gl.uniform2f(this._drawShader.uniforms.uDrawSize, this._drawWidth, this._drawHeight);
	}

	_leaveRender (force) {
		if (!force && !this._isRendering) return ;
		this._isRendering = false;

		const gl = this._gl;

		this._shadowCopy(this._vramFrame, this._shadow, this._dither);

		gl.disableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.disableVertexAttribArray(this._drawShader.attributes.aColor);

		gl.enableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexture);

		// ==== Setup program
		gl.useProgram(this._copyShader.program);
		gl.disable(gl.BLEND);

		// Setup for frame copy
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
    	gl.uniform1i(this._copyShader.uniforms.sVram, 0);
	}

	_shadowCopy(target, source, dither) {
		const gl = this._gl;

		gl.disableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.disableVertexAttribArray(this._drawShader.attributes.aColor);

		gl.enableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexture);

		gl.useProgram(this._copyShader.program);
		gl.disable(gl.BLEND);

		// Setup for frame copy
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, source);
    	gl.uniform1i(this._copyShader.uniforms.sVram, 0);
	   	gl.uniform1i(this._copyShader.uniforms.uDither, dither);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyXY);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			-1,  1,
			 1,  1,
			 1, -1,
		]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			this._drawX, this._drawY,
			this._drawX, this._drawY + this._drawHeight,
			this._drawX + this._drawWidth, this._drawY + this._drawHeight,
			this._drawX + this._drawWidth, this._drawY,
		]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexture, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
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
}
