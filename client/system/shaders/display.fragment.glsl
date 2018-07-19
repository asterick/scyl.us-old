#version 300 es

// Using CRT shader by Timothy Lottes

precision mediump float;

uniform mediump usampler2D sVram;
uniform vec2 uViewportSize;
uniform vec2 uViewportPosition;
uniform vec2 uDisplaySize;

const vec2 vram_size = vec2(1024.0, 512.0);

in vec2 vTexture;
out vec4 fragColor;

const vec2 iResolution = vec2(32.0, 24.0);
#define res (iResolution.xy/6.0)

const vec2 warp = vec2(0.0000,0.0000);  // Display warp: 1.0/8.0 = extreme, 0.0 = None
const float hardScan = -8.0;            // Hardness of scanline: -8.0 = soft, -16.0 = medium
const float hardPix = -2.0;             // Hardness of pixels in scanline: -2.0 = soft, -4.0 = hard
const float maskDark = 0.5;             // Amount of shadow mask.
const float maskLight = 1.5;

// sRGB <-> Linear.
float ToLinear1(float c) {
  return (c<=0.04045) ? c / 12.92 : pow((c+0.055) / 1.055, 2.4);
}

vec3 ToLinear(vec3 c) {
  return vec3(ToLinear1(c.r), ToLinear1(c.g), ToLinear1(c.b));
}

float ToSrgb1(float c) {
  return c < 0.0031308 ? c*12.92 : 1.055 * pow(c,0.41666) - 0.055;
}
vec3 ToSrgb(vec3 c) {
  return vec3(ToSrgb1(c.r),ToSrgb1(c.g),ToSrgb1(c.b));
}

vec3 Fetch(vec2 pos,vec2 off){
  //pos = floor(pos*res+off) / res;
  if (max(abs(pos.x-0.5), abs(pos.y-0.5)) > 0.5) return vec3(0.0,0.0,0.0);

  pos = (pos * uViewportSize + uViewportPosition) / vram_size;

  vec3 color = vec3(texture(sVram, pos.xy).rgb & 0xF8u) / 255.0;

  return ToLinear(color);
}

// Distortion of scanlines, and end of screen alpha.
vec2 Warp(vec2 pos) {
  pos = pos * 2.0 - 1.0;
  pos *= vec2(1.0+(pos.y*pos.y)*warp.x, 1.0+(pos.x*pos.x)*warp.y);
  
  return pos * 0.5 + 0.5;
}

float Gaus(float pos,float scale) {
  return exp2(scale*pos*pos);
}

vec2 Dist(vec2 pos) {
  pos = pos * res;
  return -((pos-floor(pos))-vec2(0.5));
}

vec3 Horz3(vec2 pos,float off) {
  vec3 b=Fetch(pos,vec2(-1.0,off));
  vec3 c=Fetch(pos,vec2( 0.0,off));
  vec3 d=Fetch(pos,vec2( 1.0,off));
  float dst=Dist(pos).x;

  // Convert distance to weight.
  float scale=hardPix;
  float wb=Gaus(dst-1.0,scale);
  float wc=Gaus(dst+0.0,scale);
  float wd=Gaus(dst+1.0,scale);

  // Return filtered sample.
  return (b*wb+c*wc+d*wd)/(wb+wc+wd);
}

vec3 Horz5(vec2 pos,float off) {
  vec3 a=Fetch(pos,vec2(-2.0,off));
  vec3 b=Fetch(pos,vec2(-1.0,off));
  vec3 c=Fetch(pos,vec2( 0.0,off));
  vec3 d=Fetch(pos,vec2( 1.0,off));
  vec3 e=Fetch(pos,vec2( 2.0,off));
  float dst=Dist(pos).x;
  // Convert distance to weight.
  float scale=hardPix;
  float wa=Gaus(dst-2.0,scale);
  float wb=Gaus(dst-1.0,scale);
  float wc=Gaus(dst+0.0,scale);
  float wd=Gaus(dst+1.0,scale);
  float we=Gaus(dst+2.0,scale);
  // Return filtered sample.
  return (a*wa+b*wb+c*wc+d*wd+e*we)/(wa+wb+wc+wd+we);
}

float Scan(vec2 pos,float off) {
  float dst=Dist(pos).y;
  return Gaus(dst+off, hardScan);
}

vec3 Mask(vec2 pos) {
  pos.x+=pos.y*3.0;
  vec3 mask=vec3(maskDark, maskDark, maskDark);

  pos.x = fract(pos.x/6.0);

  if (pos.x<0.333)
    mask.r=maskLight;
  else if (pos.x<0.666)
    mask.g=maskLight;
  else 
    mask.b=maskLight;
  return mask;
}    

vec3 Tri(vec2 pos) {
  vec3 a = Horz3(pos,-1.0) * Scan(pos,-1.0);
  vec3 b = Horz5(pos, 0.0) * Scan(pos, 0.0);
  vec3 c = Horz3(pos, 1.0) * Scan(pos, 1.0);
  return a + b + c;
}

void main(void) {
  vec2 fragCoord = (vTexture * vec2(1.0, -1.0) + 1.0) / 2.0;
  vec2 pos = Warp(fragCoord);

  fragColor.rgb = ToSrgb(Tri(pos) * Mask(fragCoord * uDisplaySize));
  fragColor.a = 1.0;  
}
