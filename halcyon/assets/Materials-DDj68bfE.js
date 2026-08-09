import{V as m,k as f,D as u,q as x,af as h,f as p,al as v,e as c,P as s}from"./main-BIoil1Wg.js";const t=v.rim??{enabled:!1},g=`
attribute vec4 flex;
attribute vec3 flexAxis;
attribute vec4 iflexA;
attribute vec4 iflexB;
vec3 hxRot( vec3 v, vec3 ax, float ang ) {
  float s = sin( ang );
  float c = cos( ang );
  return v * c + cross( ax, v ) * s + ax * dot( ax, v ) * ( 1.0 - c );
}
void main() {
`,d=`
#include <beginnormal_vertex>
int   hxG   = int( flex.x + 0.5 );
vec3  hxAx  = vec3( 0.0, 1.0, 0.0 );
vec3  hxPiv = flex.yzw;
float hxAng = 0.0;
float hxSc  = 1.0;
if ( hxG > 0 ) {
  hxAng = hxG == 1 ? iflexA.x : ( hxG == 2 ? iflexA.y : ( hxG == 3 ? iflexA.z : iflexA.w ) );
  hxSc  = hxG == 1 ? iflexB.x : ( hxG == 2 ? iflexB.y : ( hxG == 3 ? iflexB.z : iflexB.w ) );
  hxAx  = normalize( flexAxis );
  objectNormal = hxRot( objectNormal, hxAx, hxAng );
}
`,y=`
#include <begin_vertex>
if ( hxG > 0 ) {
  transformed = hxPiv + hxRot( ( transformed - hxPiv ) * hxSc, hxAx, hxAng );
}
`;function R(e){const n=e.onBeforeCompile;return e.onBeforeCompile=(i,o)=>{n?.(i,o),i.vertexShader=i.vertexShader.replace("void main() {",g).replace("#include <beginnormal_vertex>",d).replace("#include <begin_vertex>",y)},e.customProgramCacheKey=()=>"halcyon-creature-rim-flex",e}function w(e,n){if(!t.enabled)return e;const i={uRimStrength:{value:t.strength??.3},uRimPower:{value:t.power??2.7},uRimSky:{value:new c(s.skyBounce)},uRimSun:{value:new c(s.sunColor)},uRimUp:{value:t.upBias??.32},uRimSunDir:{value:n}};return e.userData.rim=i,e.onBeforeCompile=o=>{Object.assign(o.uniforms,i),o.fragmentShader=o.fragmentShader.replace("void main() {",`
        uniform float uRimStrength;
        uniform float uRimPower;
        uniform vec3  uRimSky;
        uniform vec3  uRimSun;
        uniform float uRimUp;
        uniform vec3  uRimSunDir;
        void main() {
      `).replace("#include <opaque_fragment>",`
        {
          vec3 rimN = normalize( normal );
          vec3 rimV = normalize( vViewPosition );
          float rimF = pow( 1.0 - clamp( dot( rimN, rimV ), 0.0, 1.0 ), uRimPower );
          float up = clamp( rimN.y * 0.5 + 0.5, 0.0, 1.0 );
          rimF *= mix( 1.0 - uRimUp, 1.0, up );
          float lit = clamp( dot( rimN, uRimSunDir ) * 0.5 + 0.5, 0.0, 1.0 );
          outgoingLight += rimF * uRimStrength * mix( uRimSky, uRimSun, lit * lit );
        }
        #include <opaque_fragment>
      `)},e.customProgramCacheKey=()=>"halcyon-creature-rim",e}function a(e,n,i,o={}){const r=new p({color:16777215,vertexColors:!0,roughness:n,metalness:i,dithering:!0,...o});return r.name=`enemy.${e}`,r}function A(){const e=new m(.42,.72,.55).normalize(),n={shell:a("shell",.38,.06),soft:a("soft",.82,0),rock:a("rock",.94,0),horn:a("horn",.3,.55)};for(const i of Object.keys(n))R(w(n[i],e));return n.glow=new f({color:16777215,vertexColors:!0,transparent:!0,blending:x,depthWrite:!1,side:u,fog:!1,toneMapped:!0}),n.glow.name="enemy.glow",n.contact=new f({color:16777215,vertexColors:!0,transparent:!0,blending:h,premultipliedAlpha:!0,depthWrite:!1,side:u,fog:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),n.contact.name="enemy.contact",n.sunDirView=e,n}function B(e,n){const i=e?.sunDirView;if(!i)return;const o=n?.render?.lighting?.sun,r=n?.three?.camera;if(!o||!r)return;const l=S.copy(o.position);o.target&&l.sub(o.target.position),!(l.lengthSq()<1e-8)&&i.copy(l).normalize().transformDirection(r.matrixWorldInverse)}const S=new m;function P(e){if(e)for(const n of Object.keys(e))e[n]?.dispose?.()}export{A as buildMaterials,A as default,P as disposeMaterials,B as updateRim};
