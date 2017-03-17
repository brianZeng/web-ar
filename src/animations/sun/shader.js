/**
 * Created by brian on 12/10/2016.
 */
export const SHAPE_TRANSPARENT = '2', SHAPE_SOLID = '1';

export const VERTEX_SHADER = `
precision mediump float;

attribute vec4 aVertex;
uniform mat4 uModelTransform;
uniform mat4 uViewProjection;
varying float vRadius;

void main(){
  gl_Position = uViewProjection * uModelTransform * vec4(aVertex.xyz,1.0);
  vRadius = aVertex.w;
}
`;
export const FRAG_SHADER = `
precision mediump float;

const int DRAW_TRANSPARENT = ${SHAPE_TRANSPARENT};
const int DRAW_SOLID = ${SHAPE_SOLID};

varying float vRadius;
uniform vec4 uPointColor;
uniform int uDrawMode;
uniform float uLensFlareOpacity;
void main(){
  vec4 dest;
  if(uDrawMode == DRAW_TRANSPARENT){
    float r = smoothstep(0.0,1.0,vRadius);
    dest = vec4(uPointColor.rgb, r * uLensFlareOpacity * uPointColor.a);
  }
  else if(uDrawMode == DRAW_SOLID){
    dest = vec4(uPointColor.rgb, uPointColor.a);
  }
  else{
    discard;
  }
  gl_FragColor = dest;
}`;