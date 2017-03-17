/**
 * Created by brian on 9/8/16.
 */
export const vertex_shader = `
attribute vec2 aPos;

uniform float uPointSize;

void main(){
  gl_Position= vec4(aPos,0.0,1.0);
  gl_PointSize= uPointSize;
}
`;
export const frag_shader = `
precision mediump float;

const int SHADOW_DRAW_INTERSECT = 1;
const int SHADOW_DRAW_EXCLUDE = 2;
const float cBlurRadius = 0.06;
uniform float uShadowX;
uniform int uShadowDraw;
uniform vec4 uPointColor;

void main(){
  vec2 pos =(gl_PointCoord.xy - 0.5) * 2.0 * 1.1;
  vec4 pointColor = uPointColor;
  float radius = length(pos);
  if(radius > 1.0+ cBlurRadius){
    discard;
  }
  float alpha = 1.0 - smoothstep(1.0,1.0 + cBlurRadius,radius);
  float m = uShadowX;
  float x = pos.x;
  float y = pos.y;
  float r = (x*x)/(m*m) + y*y;
  if(uShadowDraw == SHADOW_DRAW_EXCLUDE){
    if(x < 0.0){ discard; }
    if(r < 1.0){
      alpha = smoothstep(1.0 - cBlurRadius * 2.0,1.0,r);
    }
  }
  else if(uShadowDraw == SHADOW_DRAW_INTERSECT){
    if(x < 0.0 && r >= 1.0 - cBlurRadius * 2.0){
       alpha = 1.0 - smoothstep(1.0,1.0 + cBlurRadius * 2.0 ,r);
    }
  }
 
  gl_FragColor = pointColor * alpha ;
}
`;
export const debug_vertex_shader = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 aQuad;
varying vec2 vTexIndex;

void main(){
  vTexIndex= aQuad;
  gl_Position = vec4(aQuad * 2.0 -1.0, 0.0, 1.0);
}
`;
export const debug_frag_shader = `
precision mediump float;

uniform vec2 uTexSize;
uniform sampler2D uSampler;

varying vec2 vTexIndex;

const float SIGMA = 6.2;
const vec2 uBlurDirection = vec2(0.001, 0.001);
const int BLUR_RADIUS = 32;

vec4 incrementalGauss1D(sampler2D s,vec2 size,vec2 origin,vec2 direction);

void main(){
  vec2 texSize = 1.0 / uTexSize;
  vec2 texIndex= vTexIndex;
 
  vec4 blurColor=incrementalGauss1D(uSampler,texSize,texIndex,uBlurDirection);
  gl_FragColor= vec4(blurColor.rgb,texture2D(uSampler,texIndex).a);
  //gl_FragColor= texture2D(uSampler,texIndex);
}

vec4 incrementalGauss1D(
	sampler2D srcTex, 
	vec2 srcTexelSize, 
	vec2 origin,
	vec2 direction
) {

	if (BLUR_RADIUS == 0)
		return texture2D(srcTex, origin);
	
	float sig2 = SIGMA * SIGMA;
	const float TWO_PI	= 6.2831853071795;
	const float E			= 2.7182818284590;
		
//	set up incremental counter:
	vec3 gaussInc;
	gaussInc.x = 1.0 / (sqrt(TWO_PI) * SIGMA);
	gaussInc.y = exp(-0.5 / sig2);
	gaussInc.z = gaussInc.y * gaussInc.y;
	
//	accumulate results:
	vec4 result = texture2D(srcTex, origin) * gaussInc.x;	
	for (int i = 1; i < BLUR_RADIUS/2; ++i) {
		gaussInc.xy *= gaussInc.yz;
		
		vec2 offset = float(i) * direction * srcTexelSize;
		result += texture2D(srcTex, origin - offset) * gaussInc.x;
		result += texture2D(srcTex, origin + offset) * gaussInc.x;
	}
	
	return result;
}
`;