import CopyFragmentShader from "raw-loader!./shaders/copy.fragment.glsl";
import CopyVertexShader from "raw-loader!./shaders/copy.vertex.glsl";
import DrawFragmentShader from "raw-loader!./shaders/draw.fragment.glsl";
import DrawVertexShader from "raw-loader!./shaders/draw.vertex.glsl";

const VRAM_WIDTH = 1024;
const VRAM_HEIGHT = 512;

export default class {
	constructor () {
		// SETUP DEFAULT REGIONS
		this.setViewport(0, 0, 256, 256);
		this.setDraw(0, 0, 256, 256);
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

		// Setup or rendering programs
		this._copyShader = this._createShader (CopyVertexShader, CopyFragmentShader);
		this._drawShader = this._createShader (DrawVertexShader, DrawFragmentShader);

		// Setup our textures
		this._blank = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._blank);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, new Uint16Array([0xFFFF]));
		gl.bindTexture(gl.TEXTURE_2D, null);

		const pixels = new Uint16Array(VRAM_WIDTH*VRAM_HEIGHT);
		for (var i = 0; i < pixels.length; i++) pixels[i] = i | 1;
		this._vram = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		this._shadow = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._shadow);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, pixels);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		// Setup the draw targets (stencil buffer used for )
		const stencil = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, VRAM_WIDTH, VRAM_HEIGHT);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);

		this._vramFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._vram, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this._shadowFrame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._shadow, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// Setup our Render buffers
		this._copyXY = gl.createBuffer();
		this._copyUV = gl.createBuffer();

		this._shadowXY = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._shadowXY);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

		this._drawXY = gl.createBuffer();
		this._drawUV = gl.createBuffer();
		this._drawRGB = gl.createBuffer();

		// Set context to render by default
		this._enterRender();
		this._render();
	}

	setDraw(x, y, width, height) {
		this._drawX = x;
		this._drawY = y;
		this._drawWidth = width;
		this._drawHeight = height;
	}

	setViewport (x, y, width, height) {
		x /= VRAM_WIDTH;
		y /= VRAM_HEIGHT;
		width /= VRAM_WIDTH;
		height /= VRAM_HEIGHT;

		this._viewport = new Float32Array([ x, y, x + width, y, x + width, y + height, x, y + height]);
		this._leaveRender();

		const gl = this._gl;
		if (gl) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
			gl.bufferData(gl.ARRAY_BUFFER, this._viewport, gl.STATIC_DRAW);
		}
	}

	resize () {
		// Lookup the size the browser is displaying the canvas.
		this._viewportWidth = this._canvas.clientWidth;
		this._viewportHeight = this._canvas.clientHeight;

		// Make the canvas the same size
		this._canvas.width  = this._viewportWidth;
		this._canvas.height = this._viewportHeight;

		const aspect = (this._viewportHeight / this._viewportWidth) * (4 / 3);
		this._project = new Float32Array([-aspect, -1, aspect, -1, aspect, 1, -aspect, 1]);
	}

	repaint () {
		const gl = this._gl;

		if (!gl) return ;

		this._leaveRender();

		// Render
		gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyXY);
		gl.bufferData(gl.ARRAY_BUFFER, this._project, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.bufferData(gl.ARRAY_BUFFER, this._viewport, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexture, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}

	_render () {
		this._enterRender();

		// TODO: DRAW SOME SHIT HERE
		const gl = this._gl;

		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._blank);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawXY);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.5,  0.3,
		    0.25, 0.6,
		    0.74, 0.6
		]), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawUV);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0, 0,
			0, 1,
			1, 0
		]), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexture, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._drawRGB);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			1, 1, 1,
			1, 1, 1,
			1, 1, 1,
		]), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aColor, 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	_enterRender () {
		if (this._isRendering) return ;
		this._isRendering = true;

		const gl = this._gl;
		// Setup our shadow frame
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFrame);
		gl.clearColor(0, 0, 0, 0);
		gl.colorMask(true, true, true, true);

		gl.enable(gl.STENCIL_TEST);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
		gl.stencilFunc(gl.ALWAYS, 1, ~0);

		// Clear it completely
		gl.viewport(0, 0, VRAM_WIDTH, VRAM_HEIGHT);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

		// Setup our program
		gl.useProgram(this._drawShader.program);

		gl.enableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexture);
		gl.enableVertexAttribArray(this._copyShader.attributes.aColor);

    	gl.uniform1i(this._drawShader.uniforms.vram, 0);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
	}

	_leaveRender () {
		if (!this._isRendering) return ;
		this._isRendering = false;

		const gl = this._gl;

		// ==== Setup shadow frame copy ====
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._vramFrame);

		gl.viewport(this._drawX, this._drawY, this._drawWidth, this._drawHeight);

		gl.enable(gl.STENCIL_TEST);
		gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
		gl.stencilFunc(gl.LESS, 0, ~0);

		gl.useProgram(this._copyShader.program);

		gl.enableVertexAttribArray(this._copyShader.attributes.aVertex);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexture);

    	gl.uniform1i(this._copyShader.uniforms.vram, 0);
    	gl.bindTexture(gl.TEXTURE_2D, this._shadow);

    	// ==== Mask in shadow frame ====
		gl.bindBuffer(gl.ARRAY_BUFFER, this._shadowXY);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			this._drawX / VRAM_WIDTH, this._drawY / VRAM_WIDTH,
			(this._drawX + this._drawWidth - 1) / VRAM_WIDTH, this._drawY / VRAM_WIDTH,
			(this._drawX + this._drawWidth - 1) / VRAM_WIDTH, (this._drawY + this._drawHeight - 1) / VRAM_WIDTH,
			this._drawX / VRAM_WIDTH, (this._drawY + this._drawHeight - 1) / VRAM_WIDTH,
		]), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexture, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

		// ==== SETUP RENDER CONTEXT ====
		// Setup for frame copy
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 1);

		gl.disable(gl.STENCIL_TEST);

    	// Select vram as our source texture
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._shadow);
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
