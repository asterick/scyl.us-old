import DisplayFragmentShader from "raw-loader!./shaders/display.fragment.glsl";
import DisplayVertexShader from "raw-loader!./shaders/display.vertex.glsl";
import DrawFragmentShader from "raw-loader!./shaders/draw.fragment.glsl";
import DrawVertexShader from "raw-loader!./shaders/draw.vertex.glsl";

const VRAM_WIDTH = 1024;
const VRAM_HEIGHT = 512;

var gl = null;

var _dirty = false;

var _memory8, _memory16;
var _drawX, _drawY;
var _viewX, _viewY, _viewWidth, _viewHeight;
var _setSrcCoff, _setDstCoff, _resetSrcCoff, _resetDstCoff;
var _clutMode, _clutX, _clutY;
var _clipX, _clipY, _clipWidth, _clipHeight;
var _viewX, _viewY, _viewWidth, _viewHeight;
var _dither;
var _masked, _setMask;

var _textureX, _textureY;
var _textureMaskX, _textureMaskY;
var _textureMaskOffsetX, _textureMaskOffsetY;

var _canvas, _viewportWidth, _viewportHeight, _aspectRatio;
var _isRendering;
var _animationFrame;

var _displayShader, _drawShader;
var _copyBuffer, _drawBuffer;
var _vram, _shadow, _framebuffer;

// Bind our function
export function set_blend_coff(setSrcCoff, setDstCoff, resetSrcCoff, resetDstCoff) {
	_setSrcCoff = setSrcCoff;
	_setDstCoff = setDstCoff;
	_resetSrcCoff = resetSrcCoff;
	_resetDstCoff = resetDstCoff;
}

export function set_texture(x, y) {
	_textureX = x;
	_textureY = y;
}

export function set_texture_mask(mx, my, ox, oy) {
	_textureMaskX = mx;
	_textureMaskY = my;
	_textureMaskOffsetX = ox;
	_textureMaskOffsetY = oy;
}

export function set_clut(mode, x, y) {
	_clutMode = mode;
	_clutX = x;
	_clutY = y;
}

export function set_draw(x, y) {
	_drawX = x;
	_drawY = x;
}

export function set_clip(x, y, width, height) {
	// This forces a copy back, and reconfigure the shader
	_leaveRender();

	_clipX = x;
	_clipY = y;
	_clipWidth = width;
	_clipHeight = height;
}

export function set_viewport (x, y, width, height) {
	_viewX = x;
	_viewY = y;
	_viewWidth = width;
	_viewHeight = height;
}

export function set_dither (dither) {
	_dither = dither;
}

export function set_mask (masked, setMask) {
	_masked = masked;
	_setMask = setMask;
}

export function attach (container) {
	if (!container) {
		window.removeEventListener("resize", _onresize);
		window.cancelAnimationFrame(_animationFrame);
		return ;
	}

	const canvas = document.getElementById(container);
	_canvas = canvas;

	// Create our context
	gl = canvas.getContext("webgl2", {
		alpha: false,
		antialias: true,
		depth: false,
		stencil: false
	});

	window.addEventListener("resize", _onresize);

	_onresize();

	// Global enable / disables
	gl.disable(gl.STENCIL_TEST);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.DITHER);
	gl.colorMask(true, true, true, true);
	gl.clearColor(0, 0, 0, 1);

	// Setup or rendering programs
	_displayShader = _createShader (DisplayVertexShader, DisplayFragmentShader);
	_drawShader = _createShader (DrawVertexShader, DrawFragmentShader);

	// Setup our vertex buffers
	_copyBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, _copyBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 1, 1, 1,-1,-1, 1,-1,-1]), gl.STATIC_DRAW);

	_drawBuffer = gl.createBuffer();

	// Video memory
	const VRAM_BYTES = new Uint8Array(VRAM_WIDTH * VRAM_HEIGHT * 4);

	_vram = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, _vram);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	_shadow = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, _shadow);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8UI, VRAM_WIDTH, VRAM_HEIGHT, 0, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, VRAM_BYTES);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	// Setup the draw targets
	_framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _shadow, 0);

	// Set context to render by default
	_enterRender();
	_requestRepaint();
}

export function register_memory(source) {
	_memory8 = new Uint8Array(source);
	_memory16 = new Uint16Array(source);
}

export function get_vram_data (x, y, width, height, target) {
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer);
	gl.readPixels(x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, _memory8, target);

	if (!_isRendering) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
}

export function set_vram_data (x, y, width, height, target) {
	gl.bindTexture(gl.TEXTURE_2D, _shadow);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, _memory8, target);

	gl.bindTexture(gl.TEXTURE_2D, _vram);
	gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, _memory8, target);
}

export function render (type, vertex_ptr, offset, count, blend, textured, color) {
	const shaded = color === 0;
	const size = 4 + (textured ? 4 : 0) + (shaded ? 4 : 0);

	_enterRender();
	_requestRepaint();

	if (blend) {
		_parityCopy();
	}

	// Drawing region
   	gl.uniform2f(_drawShader.uniforms.uDrawPos, _drawX, _drawY);

   	// Texture settings
   	gl.uniform1i(_drawShader.uniforms.uTextured, textured);
   	if (textured) {
   		const clutEnable = _clutMode < 16;

	   	gl.uniform2i(_drawShader.uniforms.uTextureOffset, _textureX, _textureY);
	   	gl.uniform2i(_drawShader.uniforms.uTextureMask, _textureMaskX, _textureMaskY);
	   	gl.uniform2i(_drawShader.uniforms.uTextureMaskOffset, _textureMaskOffsetX, _textureMaskOffsetY);
	   	gl.uniform1i(_drawShader.uniforms.uClutEnable, clutEnable);

		// Precompute some constants
	   	if (clutEnable) {
		   	gl.uniform1i(_drawShader.uniforms.uClutMode, _clutMode);
	   		gl.uniform2i(_drawShader.uniforms.uClutOffset, _clutX, _clutY);
	   		gl.uniform1i(_drawShader.uniforms.uClutIndexMask, (1 << _clutMode) - 1);
	   		gl.uniform1i(_drawShader.uniforms.uClutIndexShift, 4 - _clutMode);
	   		gl.uniform1ui(_drawShader.uniforms.uClutColorMask, (1 << (1 << _clutMode)) - 1);
	   	}
   	}

   	// Blending flags
	gl.uniform1i(_drawShader.uniforms.uSemiTransparent, blend);
	if (blend) {
		gl.uniform2f(_drawShader.uniforms.uSetCoff, _setSrcCoff, _setDstCoff);
		gl.uniform2f(_drawShader.uniforms.uResetCoff, _resetSrcCoff, _resetDstCoff);
	}

   	// Render flags
   	gl.uniform1i(_drawShader.uniforms.uMasked, _masked);
   	gl.uniform1i(_drawShader.uniforms.uSetMask, _setMask);
   	gl.uniform1i(_drawShader.uniforms.uDither, _dither);

	// Buffer draw parameters
	gl.bindBuffer(gl.ARRAY_BUFFER, _drawBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, _memory16, gl.DYNAMIC_DRAW, vertex_ptr / 2, count * size);

	// Setup our vertex pointers
	gl.vertexAttribIPointer(_drawShader.attributes.aVertex, 2, gl.SHORT, size, offset);

	if (textured) {
		gl.vertexAttribIPointer(_drawShader.attributes.aTexture, 2, gl.SHORT, size, offset+4);
		gl.enableVertexAttribArray(_drawShader.attributes.aTexture);
	} else {
		gl.vertexAttribI4i(_drawShader.attributes.aTexture, 0, 0, 0, 0);
		gl.disableVertexAttribArray(_drawShader.attributes.aTexture);
	}

	if (shaded) {
		gl.vertexAttribIPointer(_drawShader.attributes.aColor, 2, gl.SHORT, size, offset + (textured ? 8 : 4));
		gl.enableVertexAttribArray(_drawShader.attributes.aColor);
	} else {
		gl.vertexAttribI4i(_drawShader.attributes.aColor, color & 0xFFFF, color >> 16, color & 0xFFFF, color >> 16);
		gl.disableVertexAttribArray(_drawShader.attributes.aColor);
	}

	// Draw array
	gl.drawArrays(type, 0, count);

	// Set our dirty flag so we know to copy the shadow frame over
	_dirty = true;
}

function _parityCopy() {
	if (!_dirty) return ;

	gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, _clipX, _clipY, _clipX, _clipY, _clipWidth, _clipHeight);

	_dirty = false;
}

function _onresize () {
	// Lookup the size the browser is displaying the canvas.
	_viewportWidth = _canvas.clientWidth;
	_viewportHeight = _canvas.clientHeight;

	// Make the canvas the same size
	_canvas.width  = _viewportWidth;
	_canvas.height = _viewportHeight;

	_aspectRatio = (_viewportHeight / _viewportWidth) * (4 / 3);

	_requestRepaint();
}

function _requestRepaint() {
	if (_animationFrame) {
		return ;
	}

	_animationFrame = window.requestAnimationFrame(_repaint);
}

function _repaint () {
	_leaveRender();

	// Copy our viewport to the screen
	gl.viewport(0, 0, _viewportWidth, _viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);

   	gl.uniform1f(_displayShader.uniforms.uAspectRatio, _aspectRatio);
   	gl.uniform2f(_displayShader.uniforms.uViewportSize, _viewWidth, _viewHeight);
   	gl.uniform2f(_displayShader.uniforms.uViewportPosition, _viewX, _viewY);

	gl.bindBuffer(gl.ARRAY_BUFFER, _copyBuffer);
	gl.vertexAttribPointer(_displayShader.attributes.aVertex, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	_animationFrame = 0;
}

function _enterRender () {
	if (_isRendering) return ;
	_isRendering = true;

	gl.disableVertexAttribArray(_displayShader.attributes.aVertex);
	gl.enableVertexAttribArray(_drawShader.attributes.aVertex);

	// Setup our shadow frame
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer);

	// Setup our program
	gl.useProgram(_drawShader.program);

	// Select vram as TEXTURE0
	gl.uniform1i(_drawShader.uniforms.sVram, 0);

	// Setup clipping rectangle
	gl.viewport(_clipX, _clipY, _clipWidth, _clipHeight);
   	gl.uniform2f(_drawShader.uniforms.uClipPos, _clipX, _clipY);
   	gl.uniform2f(_drawShader.uniforms.uClipSize, _clipWidth, _clipHeight);

	// Select the new frame buffer / vram
	gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, _vram);
	gl.uniform1i(_drawShader.uniforms.sVram, 0);
}

function _leaveRender () {
	if (!_isRendering) return ;
	_isRendering = false;

	// Copy render buffer to target
	_parityCopy();

	// Change our attributes
	gl.disableVertexAttribArray(_drawShader.attributes.aVertex);
	gl.disableVertexAttribArray(_drawShader.attributes.aTexture);
	gl.disableVertexAttribArray(_drawShader.attributes.aColor);
	gl.enableVertexAttribArray(_displayShader.attributes.aVertex);

	// ==== Setup program
	gl.useProgram(_displayShader.program);

	// Select vram as our source texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, _vram);
	gl.uniform1i(_displayShader.uniforms.sVram, 0);

	// Set to render to display
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function _createShader (vertex, fragment) {
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
	};
}

