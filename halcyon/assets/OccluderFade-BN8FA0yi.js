import{V as g,C as e,a as m,b as F}from"./main-BM5PwmOq.js";import{damp as y}from"./CameraMath-C032dpvq.js";const M=`
varying vec3 vHalWorld;
`,x=`
#ifdef USE_INSTANCING
  vHalWorld = ( modelMatrix * instanceMatrix * vec4( transformed, 1.0 ) ).xyz;
#else
  vHalWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
#endif
`,C=`
varying vec3 vHalWorld;
uniform vec3  uHalCam;      // lens position, world
uniform vec3  uHalBody;     // the character, world
uniform float uHalAmount;   // 0..1, how much this mesh is in the way
uniform float uHalMin;      // alpha left at full fade
uniform vec2  uHalDepth;    // x = margin before the body, y = falloff length
uniform vec2  uHalCone;     // x = radius at the lens, y = radius gained per metre
uniform vec2  uHalFace;     // world normal.y band over which a wall becomes a floor
uniform vec2  uHalLens;     // x = inner, y = outer radius of the sphere at the lens
uniform vec4  uHalSlab;     // x = inner radius, y = outer radius, z = world Y a
                            // surface must clear to count as a slab rather than
                            // the floor, w = the ramp over which it does
`,S=`
{
  vec3  halAxis = uHalBody - uHalCam;
  float halLen  = max( length( halAxis ), 1e-4 );
  vec3  halDir  = halAxis / halLen;
  vec3  halRel  = vHalWorld - uHalCam;
  float halT    = dot( halRel, halDir );
  float halLat  = length( halRel - halDir * halT );

  // 1. in front of the character. THE GOVERNING TEST, and it now gates both of
  // the volumes below rather than only the cone. Anything approaching the
  // character's own depth is scenery they are standing in front of, whichever
  // volume happens to contain it, and dissolving that is how a fade stops being
  // a rescue and starts being a bug.
  float halDepthW = 1.0 - smoothstep( halLen - uHalDepth.x - uHalDepth.y,
                                      halLen - uHalDepth.x, halT );

  // 2. inside the cone swept from the lens to the character
  float halRad = uHalCone.x + max( halT, 0.0 ) * uHalCone.y;
  float halCone = halDepthW * step( 0.0, halT )
    * ( 1.0 - smoothstep( halRad * 0.70, halRad, halLat ) );

  // 2b. ...or simply draped over the lens. A market awning or a roof eave hangs
  // at exactly camera height and is never BETWEEN the camera and the character -
  // it is above both of them - so the segment test above misses it completely
  // while it eats half the frame. A sphere at the lens catches that.
  //
  // It is depth gated too, which is what lets it be generous: a wall standing
  // behind the character is at the character's own depth and survives at full
  // opacity no matter how close the lens happens to be to it.
  float halNear = halDepthW
    * ( 1.0 - smoothstep( uHalLens.x, uHalLens.y, length( halRel ) ) );
  float halW = max( halCone, halNear );

  // 3. a wall or a ceiling, never a floor.
  //
  // DERIVED FROM THE INTERPOLATED WORLD POSITION rather than from the shading
  // normal, and that is a correctness fix rather than a style one. The shading
  // normal only exists in the fragment stage of materials that shade with it:
  // patch a MeshBasicMaterial - and the level acquired some the moment another
  // piece added unlit props - and the program fails to link. Measured: 681
  // "useProgram: program not valid" warnings in one capture, from three
  // mat-occfade clones that could never compile. The screen space derivative of
  // the world position is a geometric face normal, it is available in every
  // material three compiles, and it is the more honest answer for merged flat
  // shaded level geometry anyway.
  vec3 halDx = dFdx( vHalWorld );
  vec3 halDy = dFdy( vHalWorld );
  vec3 halCr = cross( halDx, halDy );
  float halCrLen = length( halCr );
  if ( halCrLen > 1e-8 ) {
    vec3 halWN = halCr / halCrLen;
    // Orient it toward the lens, so "floor" means a surface we are standing over
    // rather than one whose triangles happen to be wound the other way. A soffit
    // seen from underneath keeps a negative y and is correctly still fadeable.
    if ( dot( halWN, uHalCam - vHalWorld ) < 0.0 ) halWN = -halWN;
    float halFace = 1.0 - smoothstep( uHalFace.x, uHalFace.y, halWN.y );

    // 3b. THE NEAR SLAB. "Up facing" and "the floor" are not the same surface,
    // and in a field of chest-high blocks they come apart completely: a block
    // presents its TOP to a lens standing beside it, the test above sees a
    // floor and refuses to fade it, and it owns half the picture from 1.2 m
    // away. Same argument for a market table top across the character's waist.
    //
    // The distinguishing quantity is height, not normal. A surface the
    // character is STANDING ON is at their feet; a surface well above their
    // feet is one they are standing beside. So an up-facing fragment may
    // dissolve after all, but only while it is both close to the lens and
    // clearly above the soles. The moment the character climbs onto the block,
    // its top arrives at their feet and it goes solid again on its own.
    float halSlabD = 1.0 - smoothstep( uHalSlab.x, uHalSlab.y, length( halRel ) );
    float halSlabH = smoothstep( uHalSlab.z, uHalSlab.z + uHalSlab.w, vHalWorld.y );
    halFace = max( halFace, halSlabD * halSlabH );

    halW *= halFace;
  }

  gl_FragColor.a *= mix( 1.0, uHalMin, clamp( halW * uHalAmount, 0.0, 1.0 ) );
}
`,b=h=>!!(h.isMeshStandardMaterial||h.isMeshPhysicalMaterial||h.isMeshPhongMaterial||h.isMeshLambertMaterial||h.isMeshToonMaterial||h.isMeshBasicMaterial||h.isMeshMatcapMaterial);class T{constructor(a){this.ctx=a,this.entries=new Map,this.cache=new Map,this.hits=new Set,this.uCam={value:new g},this.uBody={value:new g},this.uMin={value:e.occluderFadeAlpha},this.uDepth={value:new m(e.occluderFadeMargin,e.occluderFadeFalloff)},this.uCone={value:new m(e.occluderFadeConeBase,e.occluderFadeConeSpread)},this.uFace={value:new m(e.occluderFadeFloorLo,e.occluderFadeFloorHi)},this.uLens={value:new m(0,0)},this.uSlab={value:new F(0,.02,0,1)}}mark(a){if(!(!a||!a.isMesh)&&!this.hits.has(a)){if(!this.cache.has(a)){if(this.hits.size+this.entries.size>=e.occluderFadeMaxMeshes)return;const t=a.material;if(!t||Array.isArray(t)||t.transparent||!b(t))return}this.hits.add(a)}}update(a,t,r,n,i,u){this.uCam.value.copy(t),this.uBody.value.copy(r),this.uMin.value=e.occluderFadeAlpha,this.uDepth.value.set(e.occluderFadeMargin,e.occluderFadeFalloff),this.uCone.value.set(e.occluderFadeConeBase,e.occluderFadeConeSpread),this.uFace.value.set(e.occluderFadeFloorLo,e.occluderFadeFloorHi);const d=Number.isFinite(n)?Math.max(.02,n):e.occluderFadeLensRadius;this.uLens.value.set(d*e.occluderFadeLensInner,d);const c=Math.max(.02,Number.isFinite(u)?u:e.occluderSlabRadius??0),f=Math.min(c-.01,c*(e.occluderSlabInner??.55)),l=Number.isFinite(i)?i:(r?.y??0)-e.guardBodyOffset;this.uSlab.value.set(Math.max(0,f),c,l+(e.occluderSlabAboveFeet??.36),Math.max(.02,e.occluderSlabFalloff??.42));for(const s of this.hits)if(!this.entries.has(s)){const o=this._make(s);o&&this.entries.set(s,o)}const p=y(e.occluderFadeInSpeed,a),H=y(e.occluderFadeOutSpeed,a);for(const[s,o]of this.entries){const v=this.hits.has(s)?1:0,w=v>o.amount?p:H;if(o.amount+=(v-o.amount)*w,o.amount>.999&&(o.amount=1),o.amount<=.004&&v===0){s.material===o.faded&&(s.material=o.original),this.entries.delete(s);continue}o.uniforms.value=o.amount,s.material!==o.faded&&(s.material=o.faded)}this.hits.clear()}releaseAll(){for(const[a,t]of this.entries)a.material===t.faded&&(a.material=t.original),t.amount=0,t.uniforms.value=0;this.entries.clear(),this.hits.clear()}dispose(){this.releaseAll();for(const a of this.cache.values())a.faded.dispose();this.cache.clear()}_make(a){const t=this.cache.get(a);if(t)return a.material!==t.faded&&(t.original=a.material),t.amount=0,t.uniforms.value=0,t;const r=a.material;if(!r||Array.isArray(r)||!b(r))return null;const n=this,i=r.clone(),u={value:0};i.name=`${r.name||"mat"}-occfade`,i.transparent=!0,i.depthWrite=!0,i.depthTest=!0;const d=r.onBeforeCompile,c=r.customProgramCacheKey;i.onBeforeCompile=function(l,p){d&&d.call(this,l,p),l.uniforms.uHalCam=n.uCam,l.uniforms.uHalBody=n.uBody,l.uniforms.uHalAmount=u,l.uniforms.uHalMin=n.uMin,l.uniforms.uHalDepth=n.uDepth,l.uniforms.uHalCone=n.uCone,l.uniforms.uHalFace=n.uFace,l.uniforms.uHalLens=n.uLens,l.uniforms.uHalSlab=n.uSlab,l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
${M}`).replace("#include <project_vertex>",`#include <project_vertex>
${x}`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
${C}`).replace("#include <dithering_fragment>",`${S}
#include <dithering_fragment>`)},i.customProgramCacheKey=function(){return`halcyon-occfade|${c?c.call(this):""}`},i.needsUpdate=!0;const f={mesh:a,original:r,faded:i,amount:0,uniforms:u};return this.cache.set(a,f),f}}export{T as OccluderFade,T as default};
