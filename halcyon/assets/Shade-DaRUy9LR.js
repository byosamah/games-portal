import{e as h,P as s,b8 as A}from"./main-BIoil1Wg.js";import{SUN_DIR as u}from"./Geom-lhsTUJr_.js";import"./BufferGeometryUtils-CEBdLM9o.js";const o=A.shade,e=A.rock.strata,H=A.ground.slab,m={uHalSky:{value:new h(s.skyFloor)},uHalBounce:{value:new h(s.groundBounce)},uHalSun:{value:u.clone()},uHalRoomCol:{value:new h(s.roomShade)},uHalLamp:{value:new h(s.lampWarm)},uHalBedWarm:{value:new h(s.rockBedWarm)},uHalBedCool:{value:new h(s.rockBedCool)},uHalRecess:{value:new h(s.rockRecess)}},v=`
varying vec3 vHalWPos;
uniform vec3 uHalSky;
uniform vec3 uHalBounce;
uniform vec3 uHalSun;
uniform vec3 uHalRoomCol;
uniform vec3 uHalLamp;
uniform vec3 uHalBedWarm;
uniform vec3 uHalBedCool;
uniform vec3 uHalRecess;
float halH1(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
float halH2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`,d=`
varying vec3 vHalWPos;
`,P=`
{
  vec4 halP = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    halP = instanceMatrix * halP;
  #endif
  vHalWPos = ( modelMatrix * halP ).xyz;
}
`,S=`
{
  float halUp = halN.y * 0.5 + 0.5;
  float halDome = mix( HAL_FILL_DOWN, 1.0, halUp * halUp );
  vec3 halTint = mix( uHalSky, uHalBounce, ( 1.0 - halUp ) * ( 1.0 - halUp ) * HAL_BOUNCE );
  float halM1 = sin( vHalWPos.x * 0.29 + vHalWPos.y * 0.17 )
              * cos( vHalWPos.z * 0.23 - vHalWPos.y * 0.11 );
  float halM2 = sin( vHalWPos.x * 3.1 - vHalWPos.z * 2.7 )
              * cos( vHalWPos.y * 2.3 + vHalWPos.z * 1.9 );
  halDome *= 1.0 + HAL_MOTTLE * halM1 + HAL_MOTTLE * 0.42 * halM2;
  float halPeak = max( max( diffuseColor.r, diffuseColor.g ), diffuseColor.b );
  vec3 halHue = mix( vec3( 1.0 ), diffuseColor.rgb / max( 0.06, halPeak ), HAL_ALBEDO );
  float halKey = 1.0 - HAL_KEYCUT * max( 0.0, dot( halN, uHalSun ) );
  totalEmissiveRadiance += halTint * halHue * ( HAL_FILL * halDome * halKey );
}
`,p=`
{
  float halDepth = clamp( 1.0 - ( vHalWPos.y - HAL_ROOM_Y0 ) / HAL_ROOM_H, 0.0, 1.0 );
  float halWin = halH2( floor( vHalWPos.xz * 0.55 ) + floor( vHalWPos.y * 0.42 ) );
  float halLit = smoothstep( 0.58, 0.92, halWin );
  vec3 halIn = uHalRoomCol * ( HAL_ROOM_FILL * ( 0.30 + 0.70 * halDepth * halDepth ) );
  halIn += uHalLamp * ( HAL_LAMP * halLit * ( 0.22 + 0.78 * halDepth ) );
  totalEmissiveRadiance += halIn;
}
`,E=`
{
  float halWarp = ( sin( vHalWPos.x * HAL_WARP_HZ + 0.7 )
                  + cos( vHalWPos.z * HAL_WARP_HZ * 1.37 - 0.7 ) ) * HAL_WARP;
  float halS = ( vHalWPos.y + halWarp ) / HAL_BAND_H;
  float halBi = floor( halS );
  float halF = halS - halBi;
  float halHb = halH1( halBi );
  float halHc = halH1( halBi * 7.919 + 1.3 );
  float halM = 1.0 + ( halHb - 0.5 ) * HAL_BAND_V;
  halM *= 1.0 - HAL_RECESS * ( 1.0 - smoothstep( 0.0, HAL_RECESS_TO, halF ) );
  halM *= 1.0 + HAL_CAP * smoothstep( HAL_CAP_FROM, 1.0, halF ) * clamp( halN.y + 0.55, 0.0, 1.0 );
  halM *= 1.0 + HAL_FINE * sin( ( vHalWPos.y + halWarp ) * HAL_FINE_HZ + halHb * 6.283 );
  vec3 halBed = halHc > 0.62 ? uHalBedCool : uHalBedWarm;
  float halPk = max( max( halBed.r, halBed.g ), halBed.b );
  diffuseColor.rgb *= halM;
  diffuseColor.rgb = mix( diffuseColor.rgb,
    diffuseColor.rgb * ( halBed / max( 0.06, halPk ) ),
    HAL_BED_MIX * ( 0.45 + 1.1 * abs( halHc - 0.5 ) ) );
  float halRec = HAL_RECESS_HUE * ( 1.0 - smoothstep( 0.0, HAL_RECESS_TO * 1.4, halF ) );
  float halRk = max( max( uHalRecess.r, uHalRecess.g ), uHalRecess.b );
  diffuseColor.rgb = mix( diffuseColor.rgb,
    diffuseColor.rgb * ( uHalRecess / max( 0.06, halRk ) ), halRec );
}
`,W=`
{
  float halUpF = smoothstep( 0.42, 0.72, halN.y );
  if ( halUpF > 0.001 ) {
    float halIz = floor( ( vHalWPos.z - HAL_ORIGIN_Z ) / HAL_STEP + 0.5 );
    float halSh = mod( abs( halIz ), 2.0 ) > 0.5 ? HAL_STEP * HAL_ROWSHIFT : 0.0;
    float halIx = floor( ( vHalWPos.x - halSh ) / HAL_STEP + 0.5 );
    vec2 halC = vec2( halIx * HAL_STEP + halSh, halIz * HAL_STEP + HAL_ORIGIN_Z );
    vec2 halQ = ( vHalWPos.xz - halC ) / HAL_STEP * 2.0;
    float halEdge = max( abs( halQ.x ), abs( halQ.y ) );
    float halHs = halH2( vec2( halIx, halIz ) );
    float halHt = halH2( vec2( halIx + 91.0, halIz - 73.0 ) );
    float halM = 1.0 + ( halHs - 0.5 ) * HAL_SLAB_V;
    float halWarm = ( halHt - 0.5 ) * HAL_SLAB_HUE;
    // the joint, and the bright arris that sits just inside it
    float halJ = smoothstep( 1.0 - HAL_JOINT_W, 1.0, halEdge );
    float halA = smoothstep( 1.0 - HAL_JOINT_W * 2.6, 1.0 - HAL_JOINT_W * 1.2, halEdge )
               * ( 1.0 - halJ );
    halM *= 1.0 - HAL_JOINT * halJ;
    halM *= 1.0 + HAL_ARRIS * halA;
    // two octaves of grain: one at slab scale, one at hand scale
    float halG = sin( vHalWPos.x * 1.7 + vHalWPos.z * 1.3 ) * cos( vHalWPos.z * 2.1 - vHalWPos.x * 0.9 );
    float halG2 = sin( vHalWPos.x * 11.0 - vHalWPos.z * 8.3 ) * cos( vHalWPos.z * 9.7 + vHalWPos.x * 7.1 );
    halM *= 1.0 + HAL_GRAIN * halG + HAL_GRAIN * 0.45 * halG2;
    halM *= HAL_PAVE_LEVEL;
    vec3 halCol = vec3( halM * ( 1.0 + halWarm ), halM * ( 1.0 + halWarm * 0.2 ), halM * ( 1.0 - halWarm ) );
    diffuseColor.rgb *= mix( vec3( 1.0 ), halCol, halUpF );
  }
}
`;function R(a){return Number(a).toFixed(5)}function x(a){let l=`vec3 halN = normalize( normal * mat3( viewMatrix ) );
`;const r=(_,c)=>{let n=_;const t=Object.keys(c).sort((i,f)=>f.length-i.length);for(const i of t)n=n.split(i).join(R(c[i]));return n};return a.strata&&(l+=r(E,{HAL_WARP_HZ:e.warpHz,HAL_WARP:e.warp*.5*(a.strataGain??1),HAL_BAND_H:e.bandH*(a.bandScale??1),HAL_BAND_V:e.bandValue*(a.strataGain??1),HAL_RECESS:e.recess*(a.strataGain??1),HAL_RECESS_TO:e.recessTo,HAL_CAP:e.capGain*(a.strataGain??1),HAL_CAP_FROM:e.capFrom,HAL_FINE:e.fine,HAL_FINE_HZ:e.fineHz,HAL_BED_MIX:e.bandHue*(a.strataGain??1),HAL_RECESS_HUE:e.recessHue})),a.pave&&(l+=r(W,{HAL_ORIGIN_Z:H.originZ,HAL_STEP:H.step,HAL_ROWSHIFT:H.rowShift,HAL_SLAB_V:H.fragValue,HAL_SLAB_HUE:H.fragHue,HAL_JOINT_W:H.fragJointWidth,HAL_JOINT:H.fragJoint,HAL_ARRIS:H.fragArris,HAL_GRAIN:H.fragGrain,HAL_PAVE_LEVEL:a.paveLevel??H.fragLevel})),a.fill!==!1&&(l+=r(S,{HAL_FILL_DOWN:o.fillDown,HAL_BOUNCE:o.bounce,HAL_MOTTLE:o.mottle,HAL_ALBEDO:o.albedo,HAL_KEYCUT:o.keyCut,HAL_FILL:a.fillAmount??o.fill})),a.room&&(l+=r(p,{HAL_ROOM_Y0:o.roomY0,HAL_ROOM_H:o.roomHeight,HAL_ROOM_FILL:o.roomFill,HAL_LAMP:o.lamp})),l}function g(a,l={}){if(!a||a.userData?.halShade)return a;const r=x(l),_=`${l.strata?"S":""}${l.pave?"P":""}${l.room?"R":""}${(l.fillAmount??o.fill).toFixed(3)}-${(l.paveLevel??0).toFixed(2)}-${(l.strataGain??1).toFixed(2)}-${(l.bandScale??1).toFixed(2)}`,c=a.onBeforeCompile,n=a.customProgramCacheKey;return a.onBeforeCompile=(t,i)=>{c?.call(a,t,i);for(const[f,L]of Object.entries(m))t.uniforms[f]=L;t.vertexShader=t.vertexShader.replace("#include <common>",`#include <common>
${d}`).replace("#include <project_vertex>",`#include <project_vertex>
${P}`),t.fragmentShader=t.fragmentShader.replace("#include <common>",`#include <common>
${v}`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
{
${r}
}`)},a.customProgramCacheKey=()=>`halcyon-shade-${_}|${n?n.call(a):""}`,a.emissive?.setHex(0),a.emissiveIntensity=1,a.userData.halShade=!0,a.needsUpdate=!0,a}export{m as U,g as applyShade,g as default};
