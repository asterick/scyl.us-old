import { mat4 } from "gl-matrix";

import CopyFragmentShader from "raw-loader!./shaders/copy.fragment.glsl";
import CopyVertexShader from "raw-loader!./shaders/copy.vertex.glsl";
import DrawFragmentShader from "raw-loader!./shaders/draw.fragment.glsl";
import DrawVertexShader from "raw-loader!./shaders/draw.vertex.glsl";

const VRAM_WIDTH = 1024;
const VRAM_HEIGHT = 512;

export default class {
	constructor () {
		// SETUP DRAW STATE
		this.setViewport(0, 0, 256, 240);
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

		// Setup or rendering programs
		this._copyShader = this._createShader (CopyVertexShader, CopyFragmentShader);
		//this._drawShader = this._createShader (DrawVertexShader, DrawFragmentShader);

		// Setup our texture / frame buffer
		this._vram = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this._vram);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, new Uint16Array(VRAM_WIDTH*VRAM_HEIGHT));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		this._frame = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frame);
		this._frame.width = VRAM_WIDTH;
		this._frame.height = VRAM_HEIGHT;  		
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._vram, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// Setup our Render buffers
		this._copyXY = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyXY);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, 1, 1,-1, 1]), gl.STATIC_DRAW);

		this._copyUV = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.bufferData(gl.ARRAY_BUFFER, this._viewport, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// Setup context and programs
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);
	}

	setViewport (x, y, width, height) {
		x /= VRAM_WIDTH;
		y /= VRAM_HEIGHT;
		width /= VRAM_WIDTH;
		height /= VRAM_HEIGHT;

		this._viewport = new Float32Array([ x, y, x + width, y, x + width, y + height, x, y + height]);

		const gl = this._gl;
		if (gl) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
			gl.bufferData(gl.ARRAY_BUFFER, this._viewport, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}

	resize () {
		// Lookup the size the browser is displaying the canvas.
		this._viewportWidth = this._canvas.clientWidth;
		this._viewportHeight = this._canvas.clientHeight;

		// Check if the canvas is not the same size.
		if (this._canvas.width  != this._viewportWidth ||
			this._canvas.height != this._viewportHeight) {

			// Make the canvas the same size
			this._canvas.width  = this._viewportWidth;
			this._canvas.height = this._viewportHeight;
		}

		const aspect = this._viewportWidth / this._viewportHeight * 3 / 4;
		this._displayMatrix = mat4.ortho(mat4.create(), -aspect, aspect, 1, -1, -100, 100);
	}

	repaint () {
		const gl = this._gl;

		if (!this._gl) return ;

		gl.viewport(0, 0, this._viewportWidth, this._viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.useProgram(this._copyShader.program);
		gl.uniformMatrix4fv(this._copyShader.uniforms.uPMatrix, false, this._displayMatrix);

    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, this._vram);
    	gl.uniform1i(this._copyShader.uniforms.uSampler, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyXY);
		gl.enableVertexAttribArray(this._copyShader.attributes.aVertexPosition);
		gl.vertexAttribPointer(this._copyShader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this._copyUV);
		gl.enableVertexAttribArray(this._copyShader.attributes.aTexturePosition);
		gl.vertexAttribPointer(this._copyShader.attributes.aTexturePosition, 2, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
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
