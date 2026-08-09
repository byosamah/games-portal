import{V as p,bg as e,b as r,e as o,P as h,M as w,a as l,z as y,D as C,l as g,U as z,a1 as c,as as v}from"./main-BM5PwmOq.js";const S=`
const mat2 H_ROT = mat2(0.80, 0.60, -0.60, 0.80);

// Hash without sine. Stable across drivers, which matters because a sine based
// hash gives different clouds on different GPUs and screenshots stop matching.
float hHash21(vec2 p) {
  vec3 p3 = fract(vec3(p.x, p.y, p.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hHash21(i);
  float b = hHash21(i + vec2(1.0, 0.0));
  float c = hHash21(i + vec2(0.0, 1.0));
  float d = hHash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float hFbm2(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 2; i++) { s += a * hNoise(p); p = H_ROT * p * 2.03; a *= 0.5; }
  return s * 1.333333;
}

float hFbm3(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * hNoise(p); p = H_ROT * p * 2.03; a *= 0.5; }
  return s * 1.142857;
}

float hFbm4(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * hNoise(p); p = H_ROT * p * 2.03; a *= 0.5; }
  return s * 1.066667;
}

float hFbm5(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * hNoise(p); p = H_ROT * p * 2.03; a *= 0.5; }
  return s * 1.032258;
}

/**
 * The sky ramp, as a function of how far up the dome you are looking.
 * bands = (hazeBand, horizonBand, zenithBand, zenithBias).
 *
 * Four stops, not two: fog colour exactly at the waterline so the sea horizon
 * seam is invisible, warm haze just above it, pale hot horizon, then the deep
 * zenith. Two stop skies are why so many WebGL scenes look like a tech demo.
 */
vec3 hSkyGradient(float h, vec3 fogC, vec3 hazeC, vec3 horizonC, vec3 zenithC, vec4 bands) {
  float t1 = smoothstep(-0.012, bands.x, h);
  float t2 = smoothstep( 0.008, bands.y, h);
  float t3 = smoothstep( 0.050, bands.z, h);
  vec3 c = mix(fogC, hazeC, t1);
  c = mix(c, horizonC, t2);
  c = mix(c, zenithC, pow(t3, bands.w));
  return c;
}

/** Broad aureole plus a tighter inner glow. Not a lens flare. */
vec3 hSunGlow(float sd, vec3 sunC, float strength) {
  float s = max(sd, 0.0);
  float broad = pow(s, 5.0) * 0.26;
  float inner = pow(s, 70.0) * 0.42;
  return sunC * ((broad + inner) * strength);
}

/** Interleaved gradient noise. Static in screen space, so it never crawls. */
float hIGN(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

/**
 * Curved cloud plane. A true ray/plane intersection blows up as dir.y goes to
 * zero; adding the curve term to the denominator compresses the last few degrees into
 * a finite band instead, which is both stable and what a real cloud deck looks
 * like from a beach.
 */
vec2 hCloudPlane(vec3 dir, float scale, float curve) {
  return (dir.xz / (max(dir.y, 0.0) + curve)) * scale;
}
`,x=`
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
varying vec3 vRay;

void main() {
  // Reconstruct the world space view ray from the clip space corner. Because
  // w is 1 across the whole quad this interpolates exactly, so every pixel
  // gets the true ray rather than an approximation.
  vec4 vpos = uInvProj * vec4(position.xy, 1.0, 1.0);
  vRay = mat3(uCamWorld) * (vpos.xyz / vpos.w);

  // Sit on the far plane so the depth test discards anything the world drew.
  gl_Position = vec4(position.xy, 0.999999, 1.0);
}
`,D=`
${S}

uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uHaze;
uniform vec3 uFogColor;
uniform vec4 uBands;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec2 uSunFlat;        // normalised sun direction on the ground plane
uniform float uSunHalo;
uniform float uSunDisc;
uniform vec2 uSunDiscEdge;
uniform float uHorizonGlow;

uniform vec3 uCloudLit;
uniform vec3 uCloudShadow;
uniform vec3 uCloudBase;
uniform vec3 uCirrusColor;

uniform float uTime;
uniform vec4 uCloudLow;       // scale, curve, coverage, softness
uniform vec4 uCloudLowB;      // warp, opacity, sunStep, shadowGain
uniform vec3 uCloudLowC;      // upStep, baseMix, densityShade
uniform vec2 uWindLow;
uniform vec2 uLowFade;
uniform float uCloudRim;

uniform vec4 uCirrus;         // scale, curve, coverage, softness
uniform vec4 uCirrusB;        // stretch, opacity, cos(angle), sin(angle)
uniform vec2 uWindHigh;
uniform vec2 uHighFade;

uniform float uDither;

varying vec3 vRay;

void main() {
  vec3 dir = normalize(vRay);
  float sd = dot(dir, uSunDir);

  vec3 col = hSkyGradient(dir.y, uFogColor, uHaze, uHorizon, uZenith, uBands);

  // Warm scatter along the horizon on the sun's side. This is the single cue
  // that reads as "hot afternoon" rather than "blue gradient".
  float lowBand = 1.0 - smoothstep(0.0, 0.34, dir.y);
  col += uSunColor * (pow(max(sd, 0.0), 3.0) * lowBand * uHorizonGlow);

  float sunUp = smoothstep(-0.05, 0.07, uSunDir.y);

  // ---- clouds ----------------------------------------------------------
  // Every one of these branches is a real saving: sky is only a slice of the
  // frame, cloud is only a slice of the sky, and the sun sample is only needed
  // where there is actually cloud to shade.

  // High cirrus first, so cumulus sits in front of it. The streaks are laid
  // along a FIXED axis: squashing the plane coordinate's y alone stretches them
  // radially out of the zenith, and a sky full of radial smears reads as motion
  // blur rather than as weather.
  if (dir.y > uHighFade.x) {
    vec2 q = hCloudPlane(dir, uCirrus.x, uCirrus.y) + uWindHigh * uTime;
    q = vec2(q.x * uCirrusB.z + q.y * uCirrusB.w, -q.x * uCirrusB.w + q.y * uCirrusB.z);
    q.y *= uCirrusB.x;
    float ac = smoothstep(uCirrus.z, uCirrus.z + uCirrus.w, hFbm3(q));
    if (ac > 0.002) {
      ac *= uCirrusB.y * smoothstep(uHighFade.x, uHighFade.y, dir.y);
      vec3 cirrus = mix(uHaze, mix(uCirrusColor, uCloudLit, 0.5),
                        smoothstep(uHighFade.x, uHighFade.y * 2.0, dir.y));
      cirrus += uSunColor * (pow(max(sd, 0.0), 8.0) * 0.35);
      col = mix(col, cirrus, ac);
    }
  }

  // Low cumulus. One cheap noise warps the domain, which is what turns fbm's
  // cauliflower into something with billows and overhangs.
  if (dir.y > uLowFade.x) {
    vec2 pc = hCloudPlane(dir, uCloudLow.x, uCloudLow.y);
    vec2 p = pc + uWindLow * uTime;
    float w = hNoise(p * 0.55 + uTime * 0.012);
    p += vec2(w, w * 0.72) * uCloudLowB.x;

    float cov = uCloudLow.z;
    float soft = uCloudLow.w;
    float raw = hFbm4(p);
    float dens = smoothstep(cov, cov + soft, raw);

    if (dens > 0.002) {
      // FORM. Two taps of Beer-Lambert up two different offsets.
      //
      // The first walks towards the sun's azimuth, so the sun facing flank
      // lights and the far flank drops away. The second walks towards the
      // ZENITH in the projected plane, which in a cloud deck is the direction
      // of "further up this cloud": if there is more cloud above this point,
      // this point is an underside, and undersides are dark. One tap alone -
      // which is what the last round had - produces a faint edge and a flat
      // white blob, because a cumulus's strongest tonal cue is vertical, not
      // lateral.
      vec2 up = -pc / (length(pc) + 0.35);
      float t1 = smoothstep(cov, cov + soft, hFbm3(p + uSunFlat * uCloudLowB.z));
      float t2 = smoothstep(cov, cov + soft, hFbm2(p + up * uCloudLowC.x));
      // The UP tap carries most of the weight. It is the one that separates a
      // sunlit shoulder from a shaded underside, and that vertical separation
      // is what makes a cumulus a solid object instead of a smudge. The sun tap
      // only tips the balance sideways. Plus a little pure thickness, so a big
      // cloud is darker in the middle than a wisp is anywhere.
      float thick = t1 * 0.45 + t2 * 1.05 + dens * uCloudLowC.z;
      float lit = exp(-thick * uCloudLowB.w);

      vec3 cc = mix(uCloudShadow, uCloudLit, lit);
      // The base of a cumulus is not grey. It is the colour of the sky and the
      // sea bouncing up into it, which is why real cloud shadow reads blue.
      cc = mix(cc, uCloudBase, (1.0 - lit) * uCloudLowC.y);
      // ...and the sunlit shoulder is warm, not paper white.
      cc += uSunColor * (lit * lit * 0.10 * sunUp);

      // Silver lining. Thin edges facing the sun go incandescent.
      cc += uSunColor * (pow(max(sd, 0.0), 3.0) * (1.0 - dens) * uCloudRim * sunUp);

      // Distant cloud dissolves into the haze rather than ending abruptly.
      cc = mix(uHaze, cc, smoothstep(uLowFade.x, uLowFade.y * 2.4, dir.y));

      col = mix(col, cc, dens * uCloudLowB.y * smoothstep(uLowFade.x, uLowFade.y, dir.y));
    }
  }

  // ---- the sun ---------------------------------------------------------
  col += hSunGlow(sd, uSunColor, uSunHalo * sunUp);
  col += uSunColor * (smoothstep(uSunDiscEdge.x, uSunDiscEdge.y, sd) * uSunDisc * sunUp);

  gl_FragColor = vec4(col, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  // One LSB of static screen space noise. Without this a sky this smooth
  // contours into visible bands on any eight bit display.
  gl_FragColor.rgb += (hIGN(gl_FragCoord.xy) - 0.5) * (uDither / 255.0);
}
`,d=new p,m=new p;class H{constructor(s){this.ctx=s,this.mesh=null,this.material=null,this.uniforms=null,this.sunDir=new p,this._manualTod=.5,this._applyManualSun(),this.atmosphere={sunDir:this.sunDir,sunColor:new o(h.sunColor),zenith:new o(e.zenithDay),horizon:new o(e.horizonDay),haze:new o(e.hazeDay),fog:new o(h.skyHaze),cloudLit:new o(e.cloudLit),cloudShadow:new o(e.cloudShadow),cloudBase:new o(e.cloudBase),bands:new r(e.hazeBand,e.horizonBand,e.zenithBand,e.zenithBias),halo:e.sunHalo,day:1},this._dayColors={zenith:new o(e.zenithDay),horizon:new o(e.horizonDay),haze:new o(e.hazeDay),sun:new o(h.sunColor),cloudLit:new o(e.cloudLit),cloudShadow:new o(e.cloudShadow),cloudBase:new o(e.cloudBase)},this._duskColors={zenith:new o(e.zenithDusk),horizon:new o(e.horizonDusk),haze:new o(e.hazeDusk),sun:new o(e.sunColorDusk),cloudLit:new o(e.cloudLitDusk),cloudShadow:new o(e.cloudShadowDusk),cloudBase:new o(e.cloudShadowDusk).multiplyScalar(.82)}}init(){const s={uZenith:{value:new o(e.zenithDay)},uHorizon:{value:new o(e.horizonDay)},uHaze:{value:new o(e.hazeDay)},uFogColor:{value:new o(h.skyHaze)},uBands:{value:new r(e.hazeBand,e.horizonBand,e.zenithBand,e.zenithBias)},uSunDir:{value:this.sunDir.clone()},uSunColor:{value:new o(h.sunColor)},uSunFlat:{value:new l(1,0)},uSunHalo:{value:e.sunHalo},uSunDisc:{value:e.sunDisc},uSunDiscEdge:{value:new l(e.sunDiscInner,e.sunDiscOuter)},uHorizonGlow:{value:e.horizonGlow},uCloudLit:{value:new o(e.cloudLit)},uCloudShadow:{value:new o(e.cloudShadow)},uCloudBase:{value:new o(e.cloudBase)},uCirrusColor:{value:new o(e.cirrusColor)},uTime:{value:0},uCloudLow:{value:new r(e.cloudScaleLow,e.cloudCurveLow,e.cloudCoverage,e.cloudSoftness)},uCloudLowB:{value:new r(e.cloudWarp,e.cloudOpacity,e.cloudSunStep,e.cloudShadowGain)},uCloudLowC:{value:new p(e.cloudUpStep,e.cloudBaseMix,e.cloudDensityShade)},uWindLow:{value:new l(e.cloudWindLow[0],e.cloudWindLow[1])},uLowFade:{value:new l(e.cloudHorizonFade[0],e.cloudHorizonFade[1])},uCloudRim:{value:e.cloudRim},uCirrus:{value:new r(e.cirrusScale,e.cirrusCurve,e.cirrusCoverage,e.cirrusSoftness)},uCirrusB:{value:new r(e.cirrusStretch,e.cirrusOpacity,Math.cos(e.cirrusAngle),Math.sin(e.cirrusAngle))},uWindHigh:{value:new l(e.cloudWindHigh[0],e.cloudWindHigh[1])},uHighFade:{value:new l(e.cirrusHorizonFade[0],e.cirrusHorizonFade[1])},uDither:{value:e.dither},uInvProj:{value:new w},uCamWorld:{value:new w}};this.material=new y({uniforms:s,vertexShader:x,fragmentShader:D,depthTest:!0,depthWrite:!1,fog:!1,side:C,toneMapped:!0}),this.uniforms=this.material.uniforms,this.mesh=new g(new z(2,2),this.material),this.mesh.name="halcyon-sky",this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.renderOrder=1e4,this.mesh.userData.noBathymetry=!0,this.ctx.three.scene.add(this.mesh),this.updateAtmosphere(this.ctx),this._pushUniforms()}setTimeOfDay(s){this._manualTod=c.clamp(s,0,1),this.ctx.render?.lighting?.sun||(this._applyManualSun(),this.updateAtmosphere(this.ctx),this._pushUniforms())}_applyManualSun(){const s=this._manualTod,t=c.degToRad(Math.sin(Math.PI*s)*v.sunElevationDeg),a=c.degToRad(v.sunAzimuthDeg+(s-.5)*150);this.sunDir.set(Math.cos(a)*Math.cos(t),Math.sin(t),Math.sin(a)*Math.cos(t)).normalize()}updateAtmosphere(s){const t=s.render?.lighting?.sun;t?.isLight&&(t.getWorldPosition(d),t.target?t.target.getWorldPosition(m):m.set(0,0,0),d.sub(m),d.lengthSq()>1e-6&&this.sunDir.copy(d).normalize());const a=this.atmosphere,u=c.smoothstep(this.sunDir.y,e.dayStart,e.dayFull);a.day=u;const i=this._duskColors,n=this._dayColors;a.zenith.copy(i.zenith).lerp(n.zenith,u),a.horizon.copy(i.horizon).lerp(n.horizon,u),a.haze.copy(i.haze).lerp(n.haze,u),a.sunColor.copy(i.sun).lerp(n.sun,u),a.halo=e.sunHaloDusk+(e.sunHalo-e.sunHaloDusk)*u;const f=s.three.scene.fog;return f?.color?a.fog.copy(f.color):a.fog.copy(a.haze),a.cloudLit.copy(i.cloudLit).lerp(n.cloudLit,u),a.cloudShadow.copy(i.cloudShadow).lerp(n.cloudShadow,u),a.cloudBase.copy(i.cloudBase).lerp(n.cloudBase,u),a}getAtmosphere(){return this.atmosphere}_pushUniforms(){if(!this.uniforms)return;const s=this.atmosphere,t=this.uniforms;t.uZenith.value.copy(s.zenith),t.uHorizon.value.copy(s.horizon),t.uHaze.value.copy(s.haze),t.uFogColor.value.copy(s.fog),t.uSunColor.value.copy(s.sunColor),t.uCloudLit.value.copy(s.cloudLit),t.uCloudShadow.value.copy(s.cloudShadow),t.uCloudBase.value.copy(s.cloudBase),t.uSunDir.value.copy(this.sunDir),t.uSunHalo.value=s.halo;const a=Math.hypot(this.sunDir.x,this.sunDir.z)||1;t.uSunFlat.value.set(this.sunDir.x/a,this.sunDir.z/a)}update(s,t,a){if(!this.mesh)return;const u=a.three.camera;this.updateAtmosphere(a),this._pushUniforms(),this.uniforms.uTime.value=a.time.elapsed,this.uniforms.uInvProj.value.copy(u.projectionMatrixInverse),this.uniforms.uCamWorld.value.copy(u.matrixWorld)}dispose(){this.mesh&&(this.ctx.three.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh=null),this.material?.dispose(),this.material=null}}export{S as SKY_GLSL,H as Sky,H as default};
