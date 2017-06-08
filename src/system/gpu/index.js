/***
 TODO
 ====
 * Be less crazy about copying data into buffers every frame
 * Blend / Mask modes
 * Rendering primitives
 * Paletted modes (?)
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
	}

	attach (canvas) {
		// Create our context
		const gl = canvas.getContext("webgl", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false
		});

		this._canvas = canvas;
		this._gl = gl;
		this.resize();

		// Global enable / disables
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
		gl.colorMask(true, true, true, true);
		gl.clearColor(0, 0, 0, 1);

		// Setup or rendering programs
		this._copyShader = this._createShader (CopyVertexShader, CopyFragmentShader);
		this._drawShader = this._createShader (DrawVertexShader, DrawFragmentShader);

		// Setup our vertex buffers
		this._copyBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

		this._drawBuffer = gl.createBuffer();

		// Setup our textures
		this._blank = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._blank);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, new Uint16Array([0xFFFF]));
		gl.bindTexture(gl.TEXTURE_2D, null);

		const pixels = new Uint16Array(VRAM_WIDTH*VRAM_HEIGHT);
		this._vram = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		this._shadow = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// Setup the draw targets
		this._vramFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._vram, 0);

		this._shadowFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._shadow, 0);

		// Set context to render by default
		this._enterRender();
		/*
        this._render(gl.TRIANGLE_FAN, false, new Float32Array([
            1, 1, 0.0625, 0.0625, 1, 1, 0,
           -1, 1,      0, 0.0625, 0, 1, 0,
           -1,-1,      0,      0, 0, 0, 0,
            1,-1, 0.0625,      0, 1, 0, 0,
        ]));
        */
	}

	setDraw(x, y, width, height) {
		this._leaveRender();

		this._drawX = x;
		this._drawY = y;
		this._drawWidth = width;
		this._drawHeight = height;

		x /= VRAM_WIDTH;
		y /= VRAM_HEIGHT;
		width /= VRAM_WIDTH;
		height /= VRAM_HEIGHT;
	}

	setViewport (x, y, width, height) {
		this._viewX = x / VRAM_WIDTH;
		this._viewY = y / VRAM_HEIGHT
		this._viewWidth = width / VRAM_WIDTH;
		this._viewHeight = height / VRAM_HEIGHT;
	}

	getData (x, y, width, height, target) {
		this._leaveRender();

		const gl = this._gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, target);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	setData (x, y, width, height, target) {
		this._leaveRender();

		const gl = this._gl;

		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, target);

		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, x, y, x, y, width, height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	resize () {
		// Lookup the size the browser is displaying the canvas.
		this._viewportWidth = this._canvas.clientWidth;
		this._viewportHeight = this._canvas.clientHeight;

		// Make the canvas the same size
		this._canvas.width  = this._viewportWidth;
		this._canvas.height = this._viewportHeight;

		this._aspectRatio = (this._viewportHeight / this._viewportWidth) * (4 / 3);
	}

	repaint () {
		const gl = this._gl;

		if (!gl) return ;

		this._leaveRender();

		// Copy our viewport to the screen
		gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyBuffer);

	   	gl.uniform1f(this._copyShader.uniforms.aspectRatio, this._aspectRatio);
	   	gl.uniform2f(this._copyShader.uniforms.viewPosition, this._viewX, this._viewY);
	   	gl.uniform2f(this._copyShader.uniforms.viewSize, this._viewWidth, this._viewHeight);

		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	_render (type, textured, vertexes) {
		const gl = this._gl;

		this._enterRender();

		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

		// Render our shit
	   	gl.uniform2f(this._drawShader.uniforms.textureOffset, this._textureX, this._textureY);

    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, textured ? this._vram : this._blank);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexes, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer( this._drawShader.attributes.aVertex, 2, gl.FLOAT, false, 28,  0);
		gl.vertexAttribPointer(this._drawShader.attributes.aTexture, 2, gl.FLOAT, false, 28,  8);
		gl.vertexAttribPointer(  this._drawShader.attributes.aColor, 3, gl.FLOAT, false, 28, 16);

		gl.drawArrays(type, 0, vertexes.length / 7);
	}

	_enterRender () {
		if (this._isRendering) return ;
		this._isRendering = true;

		const gl = this._gl;

		gl.disableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._copyShader.attributes.aTexture);

		// Setup our shadow frame
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

		// Setup our program
		gl.useProgram(this._drawShader.program);

		gl.enableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.enableVertexAttribArray(this._drawShader.attributes.aColor);

    	gl.uniform1i(this._drawShader.uniforms.vram, 0);
	}

	_leaveRender () {
		if (!this._isRendering) return ;
		this._isRendering = false;

		const gl = this._gl;

		gl.disableVertexAttribArray(this._drawShader.attributes.aVertex);
		gl.disableVertexAttribArray(this._drawShader.attributes.aTexture);
		gl.disableVertexAttribArray(this._drawShader.attributes.aColor);

		// ==== Copy rendered changes back to active VRAM ====
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0,
			this._drawX, this._drawY,
			this._drawX, this._drawY,
			this._drawWidth, this._drawHeight);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// ==== Setup program
		gl.useProgram(this._copyShader.program);

		gl.enableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexture);

		// ==== SETUP RENDER CONTEXT ====
		// Setup for frame copy
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.disable(gl.STENCIL_TEST);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
	}

	_createShader (vertex, fragment) {
		const gl = this._gl;

		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		var vertexShader =  gl.createShader(gl.VERTEX_SHADER);

		gl.shaderSource(fragmentShader, fragment);
		gl.compileShader(fragmentShader);

		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			return null;
		}

		gl.shaderSource(vertexShader, vertex);
		gl.compileShader(vertexShader);

		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			return null;
		}

		let shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
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
