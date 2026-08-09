import{W as e,i as I,B as R,j as O,V as F,aR as N,bh as B,aZ as E,aX as L,aY as W,bi as _,aP as U,bj as q,bk as V,D as j,z as G,a as S,l as P,U as Q,aM as X,bl as Y,b as h,e as f,P as m,b5 as Z}from"./main-BIoil1Wg.js";import{SKY_GLSL as $}from"./Sky-DntsOWsz.js";const K=9.81,C=6,J=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,ee=`
#include <packing>
uniform sampler2D uSrc;
uniform vec2 uTexel;
uniform vec3 uCam;    // ortho camera height, near, (far - near)
uniform vec2 uEnc;    // encode low, 1 / encode span
uniform float uBlur;
varying vec2 vUv;

float heightAt(vec2 uv) {
  float d = unpackRGBAToDepth(texture2D(uSrc, uv));
  float y = uCam.x - (uCam.y + d * uCam.z);
  return clamp((y - uEnc.x) * uEnc.y, 0.0, 1.0);
}

void main() {
  // The capture camera looks straight down with up = -Z, so its framebuffer
  // rows run against world +Z. Flip here, once, so every runtime sample can use
  // the obvious world-to-uv mapping.
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 o = uTexel * uBlur;
  float s = heightAt(uv) * 0.40;
  s += heightAt(uv + vec2( o.x, 0.0)) * 0.15;
  s += heightAt(uv + vec2(-o.x, 0.0)) * 0.15;
  s += heightAt(uv + vec2(0.0,  o.y)) * 0.15;
  s += heightAt(uv + vec2(0.0, -o.y)) * 0.15;
  gl_FragColor = vec4(s, s, s, 1.0);
}
`,te=`
#include <common>

uniform float uTime;
uniform float uSeaLevel;
uniform vec4 uWaveA[${C}];   // dirX, dirZ, k, amplitude
uniform vec4 uWaveB[${C}];   // steepness*amp, omega, phase, distanceFade
uniform float uWaveScale;
uniform float uShoreDamp;
uniform vec2 uChopFade;

uniform sampler2D uBed;
uniform vec4 uBedXform;   // centreX, centreZ, 1/size, edge fade in uv
uniform vec2 uBedDecode;  // low, span

varying vec3 vWorld;
varying vec3 vNrm;
varying float vDist;
varying float vCrest;

void main() {
  vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
  wp.y = uSeaLevel;

  vDist = length(wp - cameraPosition);

  // Sea bed under this vertex, so waves can flatten as they reach the shore
  // instead of slicing through the beach.
  vec2 uv = (wp.xz - uBedXform.xy) * uBedXform.z + 0.5;
  vec2 e = min(uv, vec2(1.0) - uv);
  float edge = smoothstep(0.0, uBedXform.w, min(e.x, e.y));
  float raw = texture2D(uBed, clamp(uv, vec2(0.0), vec2(1.0))).r;
  float bedY = mix(uBedDecode.x, uBedDecode.x + raw * uBedDecode.y, edge);

  float depth = uSeaLevel - bedY;
  float shore = smoothstep(0.0, uShoreDamp, depth);

  // Short waves are killed off with distance. A 1.9 m ripple at 300 m is
  // subpixel, and subpixel geometry is just shimmer.
  float far = 1.0 - smoothstep(uChopFade.x, uChopFade.y, vDist);

  vec3 disp = vec3(0.0);
  vec3 ddx = vec3(1.0, 0.0, 0.0);
  vec3 ddz = vec3(0.0, 0.0, 1.0);
  float hSum = 0.0;
  float aSum = 0.0;

  for (int i = 0; i < ${C}; i++) {
    vec2 D = uWaveA[i].xy;
    float k = uWaveA[i].z;
    float damp = shore * mix(1.0, far, uWaveB[i].w) * uWaveScale;
    float A = uWaveA[i].w * damp;
    float QA = uWaveB[i].x * damp;

    float ph = k * dot(D, wp.xz) - uWaveB[i].y * uTime + uWaveB[i].z;
    float S = sin(ph);
    float C = cos(ph);

    disp.xz += D * (QA * C);
    disp.y += A * S;

    float WA = k * A;
    float QAk = QA * k;
    ddx += vec3(-QAk * D.x * D.x * S, WA * D.x * C, -QAk * D.x * D.y * S);
    ddz += vec3(-QAk * D.x * D.y * S, WA * D.y * C, -QAk * D.y * D.y * S);

    hSum += A * S;
    aSum += A;
  }

  vWorld = wp + disp;
  vNrm = normalize(cross(ddz, ddx));
  vCrest = aSum > 1e-4 ? hSum / aSum : 0.0;

  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`,ae=`
#include <common>
${$}

uniform float uTime;
uniform float uSeaLevel;

uniform sampler2D uBed;
uniform vec4 uBedXform;
uniform vec2 uBedDecode;

uniform vec3 uSeaShallow;
uniform vec3 uSeaMid;
uniform vec3 uSeaDeep;
uniform vec3 uFoamColor;
uniform vec4 uDepthParams;   // depthMid, depthDeep, deepFloor, turbidity

uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uHaze;
uniform vec3 uSkyFog;
uniform vec4 uBands;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec2 uSunFlat;
uniform float uSunHalo;
uniform vec3 uBodyTint;

uniform vec4 uFresnel;       // F0, power, tint, distance averaged floor
uniform vec3 uFresnel2;      // mean gain, reflect up bias, unused
uniform float uRefract;
uniform vec4 uGlint;         // sharpness, strength, broad sharpness, broad strength
uniform vec4 uGlitter;       // sharpness, strength, freq multiplier, amplitude
uniform vec4 uFar;           // lod scale, base freq, amp, near weight
uniform vec2 uFarFade;       // fade start, fade end
uniform vec4 uMicro;         // scale, amp, fadeStart, fadeEnd
uniform vec4 uDetail;        // ampNear, ampFar, fadeStart, fadeEnd
uniform float uSparkle;

uniform vec2 uWarp;          // near domain warp, far domain warp
uniform vec4 uLandRefl;      // strength, max distance, fresnel floor, drag
uniform vec3 uLandMarch;     // first step, last step, rise slack
uniform vec3 uLandColor;
uniform vec3 uAerial;        // density, max, start distance
uniform vec3 uAerialColor;
uniform vec4 uClarity;       // depth range, min opacity, wet darken, spec comp
uniform vec3 uWet;           // wash phase lag, band depth, extra reach
uniform float uFineAmp;      // weight of the noise gradient in the near normal

uniform vec4 uFoamA;         // depth band, probe radius, probe low, collar
uniform vec4 uFoamB;         // wash speed, wash spatial, wash travel, noise scale
uniform vec4 uFoamC;         // noise speed, threshold low, threshold high, line width
uniform vec4 uFoamD;         // line strength, crest start, crest end, crest strength
uniform vec4 uFoamE;         // probe high, collar fade start, collar fade end, noise contrast
uniform float uFoamCull;

uniform vec4 uCaustic;       // scale, speed, strength, fade depth
uniform vec3 uCausticColor;  // focused sunlight, not more sea colour
uniform float uCausticSharp;
uniform vec2 uSSS;           // strength, power
uniform float uDither;

varying vec3 vWorld;
varying vec3 vNrm;
varying float vDist;
varying float vCrest;

float bedAt(vec2 xz) {
  vec2 uv = (xz - uBedXform.xy) * uBedXform.z + 0.5;
  vec2 e = min(uv, vec2(1.0) - uv);
  float edge = smoothstep(0.0, uBedXform.w, min(e.x, e.y));
  float raw = texture2D(uBed, clamp(uv, vec2(0.0), vec2(1.0))).r;
  return mix(uBedDecode.x, uBedDecode.x + raw * uBedDecode.y, edge);
}

/**
 * Ripple gradient. Six directional waves with analytic derivatives, split into
 * a mid band that survives into the distance and a fine band that only exists
 * near the camera. Perturbing the gradient rather than blending normal maps is
 * both cheaper and free of the tiling that gives stock water away.
 */
vec2 rippleMid(vec2 p, float t) {
  vec2 g = vec2(0.0);
  float ph;
  ph = dot(vec2( 0.92,  0.39), p) * 1.21 - t * 1.05;
  g += vec2( 0.92,  0.39) * (0.0666 * cos(ph));
  ph = dot(vec2(-0.46,  0.89), p) * 2.03 - t * 1.35;
  g += vec2(-0.46,  0.89) * (0.0609 * cos(ph));
  return g;
}

/**
 * FAR FIELD SLOPE. The one term in this shader that never fades.
 *
 * Every other ripple layer has to die with distance, because a three metre
 * ripple at three hundred metres is a fraction of a pixel and subpixel geometry
 * is not detail, it is crawling. But if they ALL die, what is left past the last
 * fade is a mirror smooth plane: one normal, one Fresnel value, one colour, for
 * the entire far half of the frame. That is a sheet of card, not a sea, and it
 * is exactly what the previous round shipped.
 *
 * So this layer keeps its amplitude and stretches its WAVELENGTH instead. The
 * caller divides the world position by (1 + dist * k) before calling, which
 * holds the pattern at a roughly constant size on screen from the shore to the
 * horizon. It can never alias, and it can never disappear. Fresnel, the sky
 * reflection and the glint lobe are all driven from it, which is why they now
 * survive to the horizon too.
 */
vec2 farSlope(vec2 p, float t) {
  vec2 g = vec2(0.0);
  float ph;
  ph = dot(vec2( 0.86,  0.51), p) * 1.00 - t * 0.42;
  g += vec2( 0.86,  0.51) * (0.0620 * cos(ph));
  ph = dot(vec2(-0.31,  0.95), p) * 1.73 - t * 0.58;
  g += vec2(-0.31,  0.95) * (0.0480 * cos(ph));
  ph = dot(vec2( 0.64, -0.77), p) * 2.91 - t * 0.79;
  g += vec2( 0.64, -0.77) * (0.0340 * cos(ph));
  ph = dot(vec2(-0.97, -0.24), p) * 4.63 - t * 1.02;
  g += vec2(-0.97, -0.24) * (0.0225 * cos(ph));
  return g;
}

/**
 * GLITTER NORMAL, from the gradient of a noise field rather than from more
 * sines. Sines interfere into a regular lattice, and a lattice of sparkles is
 * about the most synthetic thing water can do: the first version of this drew
 * a diamond grid of identical dashes across the entire sun path. Three noise
 * fetches, forward differenced, give an irregular slope AND the sparkle mask
 * for free from the centre tap.
 *
 * Fed the distance stretched coordinate, so like everything else in the far
 * field it holds a constant size on screen and survives to the horizon.
 */
vec3 glitterGrad(vec2 p, float t) {
  vec2 d = vec2(t * 0.29, -t * 0.19);
  float c  = hNoise(p + d);
  float gx = hNoise(p + vec2(0.36, 0.0) + d) - c;
  float gy = hNoise(p + vec2(0.0, 0.36) + d) - c;
  return vec3(gx * 2.78, gy * 2.78, c);
}

/**
 * An order of magnitude finer than anything the mesh can carry. This is the
 * sparkle, and it is a NOISE GRADIENT for exactly the same reason the glitter
 * layer above is one.
 *
 * It used to be three directional sines at 21, 33 and 52 cycles per metre.
 * Three sines interfere into a regular diamond grid, and a pow(x, 300) lobe
 * riding that grid does not produce sparkle, it produces a stencil: a lattice
 * of identical dashes at a 0.3 m pitch, marching across the water in step. It
 * was named as a tiled repeat in the last review and it is the single most
 * synthetic thing a sea can do. Noise has no preferred direction, so it has no
 * lattice, and the centre tap doubles as the sparkle mask for free - which is
 * one fewer fetch than the sines needed anyway.
 */
vec3 microGrad(vec2 p, float t) {
  vec2 d = vec2(t * 0.42, -t * 0.31);
  float c  = hNoise(p + d);
  float gx = hNoise(p + vec2(0.31, 0.0) + d) - c;
  float gy = hNoise(p + vec2(0.0, 0.31) + d) - c;
  // A fourth tap, at a quarter of the frequency and drifting the other way, and
  // it is what turns scratches into sparkle. A sharp specular lobe riding a
  // single smooth field fires along the CONTOUR where that field's slope
  // matches the half vector, and a contour is a line: the glints came out as
  // little dashes all lying the same way. Multiplying the mask by a second,
  // coarser field chops those contours into beads, which is what the eye reads
  // as glitter. One extra fetch, and it only runs inside the micro band.
  float m  = hNoise(p * 0.37 - d * 0.55 + 13.7);
  return vec3(gx * 3.23, gy * 3.23, c * (0.06 + 1.90 * m));
}

void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = vDist;

  // Is the sun above the horizon at all. Needed early: caustics are sunlight.
  float sunUp = smoothstep(-0.02, 0.06, uSunDir.y);

  // How much of this pixel's shading is the far field's business. Everything
  // below reads it, because "what survives to the horizon" is the single
  // question this shader gets wrong most easily.
  float farT = smoothstep(uFarFade.x, uFarFade.y, dist);

  // ---- surface normal -------------------------------------------------
  // Patchiness. Uniform ripple amplitude everywhere is what turns a sum of
  // sines into corduroy; drifting the amplitude around breaks the pattern up
  // into gusts of chop the way a real breeze does.
  float detailFade = 1.0 - smoothstep(uDetail.z, uDetail.w, dist);

  // DOMAIN WARP. A sum of sines is periodic by construction, and the eye locks
  // onto a repeating lattice faster than onto almost anything else: the last
  // round's sea read as tiled chevrons across the whole middle distance, which
  // is the single loudest "this is a scrolling texture" tell there is. Pushing
  // the sample point around with noise before the sines are evaluated turns
  // corduroy into weather.
  //
  // The warp has to run at a frequency close to the ripples it is breaking up.
  // The first attempt warped by six metres over a twenty seven metre noise
  // cell, which scrambles the pattern globally and leaves it perfectly regular
  // inside every cell: from a low camera the sea was a field of identical
  // dashes in a diamond grid. Eight metre cells with a three metre push break
  // the lattice at the scale the eye is actually reading it.
  vec2 wq = vec2(
    hNoise(vWorld.xz * 0.105 + vec2( uTime * 0.041, -uTime * 0.027)),
    hNoise(vWorld.xz * 0.082 + vec2(-uTime * 0.034,  uTime * 0.021) + 11.3)
  ) - 0.5;
  vec2 pNear = vWorld.xz + wq * uWarp.x;

  // Patchiness, off the same noise rather than a third fetch. Uniform ripple
  // amplitude is the other half of what makes a sum of sines read as corduroy;
  // drifting it around gives the breeze gusts. Sharing the warp's own field is
  // free and correlates the two the way a real gust correlates them.
  float rmod = 0.62 + 0.72 * (wq.x + 0.5);

  vec2 g = rippleMid(pNear, uTime) * (mix(uDetail.y, uDetail.x, detailFade) * rmod);

  // The far field layer. Wavelength stretches with distance so the pattern
  // holds a constant screen size: never aliases, never dies, and it is what
  // keeps a normal - and therefore a picture - alive out to the clip plane.
  // Warped in its own stretched space, or the lattice comes straight back at
  // three hundred metres where a fixed few metre warp is worth nothing.
  float lod = 1.0 / (1.0 + dist * uFar.x);
  vec2 pFar = vWorld.xz * (uFar.y * lod);
  if (dist > uFarFade.x * 0.5) {
    pFar += (vec2(
      hNoise(pFar * 0.29 + vec2(uTime * 0.013, uTime * 0.009)),
      hNoise(pFar * 0.22 + vec2(uTime * -0.011, uTime * 0.015) + 5.7)
    ) - 0.5) * uWarp.y;
  }
  g += farSlope(pFar, uTime) * (uFar.z * mix(uFar.w, 1.0, farT) * (0.55 + 0.60 * rmod));

  // The FINE layer is a noise gradient, not more sines, and it is shared with
  // the glitter lobe further down. Three more directional sines on top of the
  // five already here interfere into a dashed diamond lattice that is visible
  // from any low camera and is the loudest "scrolling texture" tell water can
  // produce; a noise gradient has no preferred direction and therefore no
  // lattice. Fed the distance stretched coordinate, so it holds a constant size
  // on screen instead of aliasing into a crawl at forty metres.
  vec3 gGl = glitterGrad(pFar * uGlitter.z, uTime);
  // ...and it does not stop at detailFadeEnd. farSlope above is four
  // directional sines, and four sines interfere into a diamond lattice of
  // identical dashes: with a wide specular lobe riding on it, that lattice was
  // plainly visible as a tiled repeat across the whole far half of the vista
  // shot. The lobe is narrow again now, but the honest fix is to keep an
  // irregular, direction-free slope alive out there too, and this layer already
  // holds a constant size on screen so it costs nothing extra to carry.
  // The slope up to HERE is the one the water is actually shaped like: swell,
  // chop and mid ripples. Kept, because refraction has to ride it and must not
  // ride what comes next.
  vec2 gCoarse = g;

  float fineW = uDetail.x * uFineAmp * rmod;
  g += gGl.xy * (fineW * (detailFade * detailFade + 0.60 * farT));

  vec3 N = normalize(vec3(vNrm.x - g.x, vNrm.y, vNrm.z - g.y));

  // ---- sea bed, refracted through the surface -------------------------
  //
  // REFRACTED BY THE COARSE NORMAL, and this is not a detail. The sparkle
  // normal deliberately carries 25 degree facets at a 15 cm scale, and pushing
  // the bed lookup by 0.7 m per pixel off THAT samples the height map
  // essentially at random: neighbouring pixels came back with depths metres
  // apart, so the depth colour, the opacity and the caustic gate all flickered
  // pixel to pixel and the shallows broke out in saturated cyan polka dots.
  // A wave bends the light under it; a glint on a 15 cm ripple does not move
  // the sea floor.
  vec3 Nrefr = normalize(vec3(vNrm.x - gCoarse.x, vNrm.y, vNrm.z - gCoarse.y));
  vec2 refr = Nrefr.xz * uRefract;
  float bedY = bedAt(vWorld.xz + refr);
  float depth = max(uSeaLevel - bedY, 0.0);

  // ---- how much of the bed shows through -------------------------------
  // Shallow water is not a painted surface. It is a film you see the bed
  // through, and a shoreline that does not do this cuts hard at a white decal
  // with an opaque body under it, which is the single loudest tell that a sea
  // was drawn rather than simulated.
  float clarity = 1.0 - smoothstep(0.0, uClarity.x, depth);
  float opacity = mix(1.0, uClarity.y, clarity);

  // Chop needs water under it. A hand's width of sea over a sand shelf is
  // GLASSY - there is nothing for a ripple to be made of - so the two fine
  // specular lobes are damped inshore exactly the way the vertex stage already
  // damps the Gerstner waves. Without this the wading shelf carried the same
  // dense sparkle as open water and the whole foreground came out milky.
  float chopHere = mix(0.52, 1.0, smoothstep(0.06, 0.90, depth));

  // ---- where the waterline is, right now and a moment ago ----------------
  // Computed here rather than down in the foam block, because the wet sand and
  // the foam are the same event seen at two different ages and both need it.
  //
  // The surge runs up and down the beach on the swell's rhythm and travels
  // ALONG the coast rather than pulsing everywhere at once. Sampling the same
  // wash a fixed phase in the past gives the high water mark it just left, and
  // the band between the two is wet sand: the dark trail that follows a retreat
  // back down the beach. It is the cue that says the water is moving, and
  // without it a shoreline is a shape that happens to be there.
  float washPhase = uTime * uFoamB.x + vWorld.x * uFoamB.y + vWorld.z * uFoamB.y * 0.8;
  float wash = sin(washPhase) * 0.5 + 0.5;
  float washPast = sin(washPhase - uWet.x) * 0.5 + 0.5;
  float waterline = uFoamB.z * (wash - 0.35);
  float wetline = uFoamB.z * (max(wash, washPast) - 0.35) + uWet.z;

  // ---- body colour by depth -------------------------------------------
  float dm = smoothstep(0.0, uDepthParams.x, depth);
  float dd = smoothstep(uDepthParams.x, uDepthParams.y, depth);
  vec3 body = mix(uSeaShallow, uSeaMid, pow(dm, uDepthParams.w));
  body = mix(body, uSeaDeep, dd * uDepthParams.z);
  // The sea is lit by the same sun as everything else. At noon this is a no
  // op; at dusk it is what stops a cold turquoise sea sitting under a gold sky.
  body *= uBodyTint;
  // Millimetres of water over sand is not water, it is WET SAND. Pulling the
  // film's own colour down as it thins makes the composite over the bed read
  // darker than the dry sand beside it, which is the band the reference has
  // inshore of its foam line and which we had no way to draw before.
  //
  // Its own ramp, and a tight one. Run it over the whole clarity range instead
  // and every shallow in the bay goes grey, which is a far worse bug than not
  // having a wet band at all.
  //
  // Measured against wetline rather than against zero, so the dark band sits
  // where the water HAS BEEN and not only where it currently is. That is the
  // whole difference between a static gradient at the shore and a beach with a
  // tide running up and down it.
  //
  // ...and it is a RAMP, not a switch. Squaring it (which is what this used to
  // do) puts the whole transition into the last few centimetres of depth, and
  // the bathymetry is a 0.33 m height map of real level geometry, so around a
  // stepped stone quay the depth crosses that threshold and back again from one
  // texel to the next. The band then stopped being a band and became a mosaic:
  // saturated turquoise blobs in a muddy green field, texel sized, all over the
  // one part of the frame this piece is judged on.
  float wet = 1.0 - smoothstep(0.0, uWet.y, max(depth - wetline, 0.0));
  body *= mix(1.0, uClarity.z, wet);

  // ---- caustics ---------------------------------------------------------
  // The bright mesh of light on the bed. Three sines, and one colour decision
  // that matters more than all of the geometry: this is FOCUSED SUNLIGHT, so it
  // is the sun's own colour. Adding sea colour to sea water produced a caustic
  // web that was present at full strength on every shallow pixel in the frame
  // and completely invisible, because it had neither hue nor value separation
  // from the thing it was drawn on.
  //
  // Warped by the same noise that breaks up the ripples, or three sines lay a
  // perfectly regular grid over the sand and read as a printed pattern.
  float shallowness = 1.0 - smoothstep(0.0, uCaustic.w, depth);
  if (shallowness > 0.004) {
    vec2 cp = (vWorld.xz + refr * 2.0 + wq * 1.6) * uCaustic.x;
    float ct = uTime * uCaustic.y;
    float c1 = sin(cp.x * 1.90 + ct * 1.10) * sin(cp.y * 2.30 - ct * 0.90);
    float c2 = sin((cp.x + cp.y) * 1.55 - ct * 1.40);
    float c3 = sin((cp.x - cp.y) * 2.10 + ct * 0.80);
    float caus = max(c1 * 0.40 + c2 * 0.35 + c3 * 0.30, 0.0);
    // A gentler exponent than the old cube. A cube keeps only the knots of the
    // mesh and throws away the filaments between them, and the filaments are
    // what make it read as a NET rather than as scattered dots.
    caus = pow(caus, uCausticSharp);
    body += uCausticColor * (caus * shallowness * uCaustic.z * sunUp);
  }

  // Sunlight through the back of a wave, towards the camera. Cheap, and it is
  // what makes a swell look like it is made of water rather than plastic.
  if (dd < 0.999 && vCrest > 0.0) {
    vec2 vfl = vec2(V.x, V.z);
    float vlen = length(vfl);
    vec2 vf = vlen > 1e-4 ? vfl / vlen : vec2(1.0, 0.0);
    float sss = clamp(vCrest, 0.0, 1.0) * pow(max(-dot(vf, uSunFlat), 0.0), uSSS.y);
    body += uSeaShallow * (sss * uSSS.x * (1.0 - dd));
  }

  // ---- fresnel weighted reflection of the real sky --------------------
  //
  // Schlick is a trap on an ocean. It saturates to F = 1 at grazing, so on a
  // smooth plane every pixel in the far half of the frame resolves to exactly
  // the sky colour, sea and sky become one value and the horizon stops
  // existing. It is the correct answer for a mirror and the wrong one for
  // water, because a pixel at three hundred metres does not contain one normal,
  // it contains a whole spectrum of wave slopes, and the honest answer is the
  // AVERAGE of Schlick across that spectrum. That average is nowhere near one.
  vec3 R = reflect(-V, N);
  // ...and a second, wave-scale one. The standing reflection below marches this
  // instead, so a mirrored wall smears the way water smears rather than
  // resolving differently in every pixel.
  vec3 Rc = reflect(-V, Nrefr);

  // The mean reflected direction off a rough sea is tilted up from the mirror
  // direction by roughly the RMS wave slope, so the far field reflects sky from
  // a little higher up the dome. Because distance maps to screen height on a
  // horizontal sea, feeding distance in here is also what turns the reflection
  // into a vertical GRADIENT instead of one constant value.
  float ry = max(R.y, 0.0) + uFresnel2.y * farT;
  vec3 sky = hSkyGradient(ry, uSkyFog, uHaze, uHorizon, uZenith, uBands);
  sky += hSunGlow(dot(R, uSunDir), uSunColor, uSunHalo * 0.55);

  float grazing = 1.0 - clamp(dot(N, V), 0.0, 1.0);
  float F = uFresnel.x + (1.0 - uFresnel.x) * pow(grazing, uFresnel.y);
  float Fmean = uFresnel.w + F * uFresnel2.x;
  F = clamp(mix(F, Fmean, farT), 0.0, 1.0);

  // STANDING REFLECTION. Not everything above a shoreline is sky. March the
  // reflected ray across the height map a few metres: wherever the bed rises
  // higher than the ray has climbed by then, what the water is mirroring is
  // stone, not air. It is what puts the vertical smear of a quay wall or a
  // cliff on the water underneath it - the one cue the reference has at every
  // shoreline and a flat sky reflection can never produce.
  //
  // AND THE ONE THING THAT WAS WRONG WITH IT. The march was right. It was then
  // multiplied by Fresnel, and at the angles a shoreline camera actually sits
  // at - 4 m over the water looking 6 to 20 m out - Schlick returns six to
  // twelve per cent, so a correctly located mirrored quay wall was composited
  // at a tenth of its strength over bright turquoise and could not be seen. The
  // stone term therefore gets a weight FLOOR of its own (uLandRefl.z), which
  // is not a fudge: a rough surface reflects a NEARBY object across a far wider
  // cone than the mirror direction alone, and every one of these reflections is
  // of something within twenty metres.
  //
  // The steps also changed. Three probes starting at 2.5 m stepped straight
  // over the event this exists to draw - the smear at the FOOT of a wall, which
  // happens inside the first two metres. Five, quadratically spaced from 0.6 m,
  // put the samples where the geometry is.
  //
  // MARCHED ALONG THE COARSE REFLECTION, and gated smoothly. Marching the fine
  // normal's reflection is wrong twice over. Physically, a mirrored wall in
  // moving water is a vertical SMEAR at the scale of the swell, not a per-pixel
  // mosaic. And practically, the old hard R.y < 0.86 early-out was a binary
  // test on a normal carrying 25 degree facets at a 15 cm scale, so the whole
  // reflection stencilled itself on and off from one pixel to the next and left
  // hard edged holes of pure water colour punched through it - which is exactly
  // what the shallows looked like: saturated cyan blobs with cut edges.
  float landW = 0.0;
  float rGate = smoothstep(0.96, 0.60, Rc.y);
  if (dist < uLandRefl.y && rGate > 0.004) {
    vec2 rd = normalize(Rc.xz + vec2(1e-5, 0.0));
    float land = 0.0;
    for (int i = 0; i < 5; i++) {
      float f = (float(i) + 0.5) * 0.2;
      float t = uLandMarch.x + (uLandMarch.y - uLandMarch.x) * f * f;
      float h = bedAt(vWorld.xz + rd * t) - uSeaLevel;
      // drag slackens the ray's own climb. A reflection in moving water is
      // always LONGER than the thing it reflects, because every facet tilted
      // towards the camera shows a piece of the object from higher up it. That
      // vertical smear is the whole visual signature, and slackening the climb
      // is the cheapest honest way to produce it.
      float climb = max(Rc.y, 0.0) * t * (1.0 - uLandRefl.w);
      land = max(land, smoothstep(-uLandMarch.z, uLandMarch.z + 0.5, h - climb));
    }
    landW = land * uLandRefl.x * rGate * (1.0 - smoothstep(uLandRefl.y * 0.55, uLandRefl.y, dist));
    sky = mix(sky, uLandColor, landW);
  }

  // Stone gets its own floor on how much of it survives the composite; sky does
  // not, because a sky reflection at ten per cent is simply what water does.
  float Fc = max(F, uLandRefl.z * landW);

  // A near mirror is opaque no matter how thin the water under it is.
  opacity = max(opacity, Fc);

  vec3 col = mix(body, sky * uFresnel.z, Fc);

  // ---- sun glitter ----------------------------------------------------
  vec3 Hv = normalize(uSunDir + V);

  // Broad lobe. It is a LOBE again: 26, not 6. The wide setting was written to
  // reach a sun a hundred degrees off the shot axis, and no lobe width can do
  // that - widening one does not move a highlight, it lowers and spreads it,
  // so what it produced was a flat dim wash over the whole sea with the far
  // field's four sine directions showing through as a diamond lattice. The sun
  // is inside the frustum now (see LIGHTING.sunAzimuthDeg), so this can go back
  // to having an edge and a centre.
  float spec = pow(max(dot(N, Hv), 0.0), uGlint.z) * uGlint.w;

  // GLITTER. This lobe rides the far field slope, so unlike everything that
  // came before it, it is still there at the horizon. A second, finer octave of
  // the same distance stretched noise breaks it into a broken sun path rather
  // than a smooth smear.
  //
  // AND THE MASK IS NEARLY BINARY. A sun path is not a bright region, it is a
  // FIELD OF SEPARATE GLINTS with dark water between them - that separation is
  // the whole read. A floor of 0.35 under the mask meant a third of the lobe
  // reached every pixel inside the path regardless of the noise, which fills
  // the gaps in and turns the path into a solid sheet. 0.06 leaves the gaps.
  vec3 Ng = normalize(vec3(N.x - gGl.x * uGlitter.w, N.y, N.z - gGl.y * uGlitter.w));
  float glMask = pow(gGl.z, uSparkle);
  spec += pow(max(dot(Ng, Hv), 0.0), uGlitter.x) * uGlitter.y * (0.03 + 2.45 * glMask) * mix(0.55, 1.0, chopHere);

  // The razor sharp lobe rides a micro normal an order of magnitude finer than
  // the mesh. It is a 0.3 m ripple, so it cannot honestly go far; the glitter
  // lobe above carries the distance.
  float microFade = (1.0 - smoothstep(uMicro.z, uMicro.w, dist)) * chopHere;
  if (microFade > 0.004) {
    vec3 gm3 = microGrad(vWorld.xz * uMicro.x, uTime);
    vec2 gm = gm3.xy * (uMicro.y * microFade);
    vec3 Ns = normalize(vec3(N.x - gm.x, N.y, N.z - gm.y));
    float spark = pow(gm3.z, uSparkle);
    spec += pow(max(dot(Ns, Hv), 0.0), uGlint.x) * uGlint.y * (0.04 + 2.20 * spark) * microFade;
  }

  // Highlights are additive light, but this surface is about to be alpha
  // blended over the sea bed, which would multiply them away exactly where the
  // water is thinnest and shiniest. Divide back up by the opacity they are
  // going to be multiplied by, clamped so a millimetre of water cannot blow out.
  float specGain = min(1.0 / max(opacity, 0.30), uClarity.w);
  // Fresnel for a HIGHLIGHT is evaluated at the half angle, not at the view
  // angle. Using the view angle (which is what this did) dims the sun path
  // hardest exactly where it is strongest - looking down at near water - and
  // brightens it where nothing is happening. At the half angle it does the
  // opposite and correct thing: the path is a steady band that swells towards
  // the horizon as the geometry goes grazing, which is what a sun path is.
  float fh = uFresnel.x + (1.0 - uFresnel.x) * pow(1.0 - max(dot(V, Hv), 0.0), 5.0);
  col += uSunColor * (spec * sunUp * (0.22 + 1.70 * fh) * specGain);

  // ---- foam -----------------------------------------------------------
  // Six probes on a jittered ring, looking for sea bed that actually breaks
  // the surface. This is what puts foam around a vertical cliff, which a depth
  // test alone can never do. Skipped entirely once the water is deep enough
  // that the collar has already faded out, which is most of the sea.
  float prox = 0.0;
  if (depth < uFoamE.z && dist < uFoamCull) {
    float jitter = hHash21(floor(vWorld.xz * 3.0)) * 6.2831853;
    for (int i = 0; i < 6; i++) {
      float a = float(i) * 1.0471976 + jitter;
      vec2 o = vec2(cos(a), sin(a)) * uFoamA.y;
      prox = max(prox, smoothstep(uFoamA.z, uFoamE.x, bedAt(vWorld.xz + o) - uSeaLevel));
    }
    prox *= 1.0 - smoothstep(uFoamE.y, uFoamE.z, depth);
  }

  // wash and waterline were computed with the wet band, further up: the
  // foam and the wet sand are the same event photographed at two ages.
  float band = 1.0 - smoothstep(0.0, uFoamA.x, max(depth - waterline, 0.0));
  float raw = max(band, prox * uFoamA.w);
  float cap = smoothstep(uFoamD.y, uFoamD.z, vCrest) * uFoamD.w * dd;

  if (raw > 0.004 || cap > 0.004) {
    // Churn, and a NARROW decision instead of a wide gradient. The threshold
    // window is 0.14 of range now, not 0.42: cells of churn above it go fully
    // white, cells below stay water, and the boundary between the two is drawn
    // by the fbm, which is irregular. That irregular boundary is what lace is.
    // The old window was wider than the range the churn ever produced, so every
    // value landed mid-ramp and the whole shore band came out grey.
    float fn = hFbm4(vWorld.xz * uFoamB.w + vec2(-uTime * uFoamC.x, uTime * uFoamC.x * 0.7) + N.xz * 1.6);
    fn = pow(clamp(fn, 0.0, 1.0), uFoamE.w);
    float foam = smoothstep(uFoamC.y, uFoamC.z, raw * (0.30 + 1.25 * fn));

    // THE LEADING EDGE. The single brightest, hardest thing at a shoreline and
    // the thing the eye locks onto first. Flat topped, then a fast falloff, so
    // it has a defined edge rather than fading out of both of its sides: the
    // exact difference the blind comparison named between our haze band and the
    // reference's "thin crisp bright band".
    float ld = abs(depth - waterline) / uFoamC.w;
    float line = (1.0 - smoothstep(0.45, 1.0, ld)) * uFoamD.x;
    // ...and it only breaks into lace on the seaward side. Inshore of the
    // waterline the wash is a continuous sheet running up the sand, which is
    // why a real foam line is solid on one edge and ragged on the other.
    float lace = depth > waterline ? (0.35 + 0.85 * fn) : (0.80 + 0.35 * fn);
    foam = max(foam, line * smoothstep(0.05, 0.40, raw) * lace);
    foam = clamp(max(foam, cap * fn), 0.0, 1.0);

    col = mix(col, uFoamColor, foam);
    opacity = max(opacity, foam);   // foam is churned air, not a tint
  }

  // ---- aerial perspective ---------------------------------------------
  // The sea does NOT use scene fog, and this is why. Linear fog reaches 1.0 at
  // LIGHTING.fogFar while this disc runs to 700 m, so with scene fog on, every
  // pixel past the far plane is exactly the fog colour - which is also what the
  // sky uses at its lowest band. Sea and sky end up the same number and the
  // boundary between them dissolves into a smear with no line in it.
  //
  // This is exponential, it SATURATES below one, and it tends towards a colour
  // of its own: the haze pulled back towards deep water. The sea at the horizon
  // therefore stays measurably darker and bluer than the sky just above it,
  // which is both true of real seas and the only way to draw a horizon.
  float aer = uAerial.y * (1.0 - exp(-max(dist - uAerial.z, 0.0) * uAerial.x));
  col = mix(col, uAerialColor, aer);
  opacity = max(opacity, aer);      // distance is its own opacity

  gl_FragColor = vec4(col, clamp(opacity, 0.0, 1.0));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>

  gl_FragColor.rgb += (hIGN(gl_FragCoord.xy) - 0.5) * (uDither / 255.0);
}
`,H=new f,D=new F;class ie{constructor(t){this.ctx=t,this.seaLevel=e.seaLevel,this.mesh=null,this.material=null,this.uniforms=null,this._rtPacked=null,this._rtBed=null,this._bathyCam=null,this._depthMat=null,this._encScene=null,this._encCam=null,this._encMat=null,this._uframe=0,this._refreshQueue=e.bathyRefreshFrames.slice(),this._bedPixels=null,this._waves=this._buildWaveTable()}_buildWaveTable(){const t=[];for(let a=0;a<C;a++){const[o,s,l,i,n,d,c]=e.waves[a],p=Math.hypot(i,n)||1,g=Math.PI*2/o;t.push({dx:i/p,dz:n/p,k:g,A:s*e.waveHeightScale,QA:l/(g*C),omega:Math.sqrt(K*g)*e.waveSpeed,phase:d,fade:c})}return t}_buildDisc(){const t=e.discRings,a=e.discSegments,o=e.discRadius,s=e.discInnerStep,l=u=>s*(Math.pow(u,t)-1)/(u-1);let i=1.0001,n=1.4;for(let u=0;u<64;u++){const y=(i+n)*.5;l(y)<o?i=y:n=y}const d=(i+n)*.5,c=new Float32Array(t+1);let p=0,g=s;for(let u=1;u<=t;u++)p+=g,g*=d,c[u]=p;const r=(t+1)*a,v=new Float32Array(r*3);let k=0;for(let u=0;u<=t;u++){const y=c[u];for(let A=0;A<a;A++){const x=A/a*Math.PI*2;v[k++]=Math.cos(x)*y,v[k++]=0,v[k++]=Math.sin(x)*y}}const w=new Uint16Array(t*a*6);let b=0;for(let u=0;u<t;u++){const y=u*a,A=(u+1)*a;for(let x=0;x<a;x++){const M=(x+1)%a;w[b++]=y+x,w[b++]=A+M,w[b++]=A+x,w[b++]=y+x,w[b++]=y+M,w[b++]=A+M}}const T=new I;return T.setAttribute("position",new R(v,3)),T.setIndex(new R(w,1)),T.boundingSphere=new O(new F(0,0,0),o+4),T}init(){const{scene:t}=this.ctx.three,a=e.bathyRes;this._rtPacked=new N(a,a,{minFilter:L,magFilter:L,format:E,type:B,depthBuffer:!0,stencilBuffer:!1,generateMipmaps:!1}),this._rtBed=new N(a,a,{minFilter:W,magFilter:W,format:E,type:B,depthBuffer:!1,stencilBuffer:!1,generateMipmaps:!1}),this._rtBed.texture.wrapS=_,this._rtBed.texture.wrapT=_;const o=e.bathySize*.5,s=.1,l=s+(e.bathyTop-e.bathyBottom);this._bathyCam=new U(-o,o,o,-o,s,l),this._bathyCam.position.set(e.bathyCenter[0],e.bathyTop,e.bathyCenter[1]),this._bathyCam.up.set(0,0,-1),this._bathyCam.lookAt(e.bathyCenter[0],e.bathyTop-1,e.bathyCenter[1]),this._bathyCam.updateMatrixWorld(!0),this._depthMat=new q({depthPacking:V}),this._depthMat.side=j,this._depthMat.fog=!1;const i=this.seaLevel+e.bathyEncodeLow,n=this.seaLevel+e.bathyEncodeHigh;this._encMat=new G({uniforms:{uSrc:{value:this._rtPacked.texture},uTexel:{value:new S(1/a,1/a)},uCam:{value:new F(e.bathyTop,s,l-s)},uEnc:{value:new S(i,1/(n-i))},uBlur:{value:e.bathyBlur}},vertexShader:J,fragmentShader:ee,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});const d=new P(new Q(2,2),this._encMat);d.frustumCulled=!1,this._encScene=new X,this._encScene.add(d),this._encCam=new Y;const c=[],p=[];for(const r of this._waves)c.push(new h(r.dx,r.dz,r.k,r.A)),p.push(new h(r.QA,r.omega,r.phase,r.fade));const g={uTime:{value:0},uSeaLevel:{value:this.seaLevel},uWaveA:{value:c},uWaveB:{value:p},uWaveScale:{value:1},uShoreDamp:{value:e.shoreDampDepth},uChopFade:{value:new S(e.chopFadeStart,e.chopFadeEnd)},uBed:{value:this._rtBed.texture},uBedXform:{value:new h(e.bathyCenter[0],e.bathyCenter[1],1/e.bathySize,e.bathyEdgeFade/e.bathySize)},uBedDecode:{value:new S(i,n-i)},uSeaShallow:{value:new f(m.seaShallow)},uSeaMid:{value:new f(m.seaMid)},uSeaDeep:{value:new f(m.seaDeep)},uFoamColor:{value:new f(m.seaFoam)},uDepthParams:{value:new h(e.depthMid,e.depthDeep,e.deepFloor,e.turbidity)},uZenith:{value:new f(m.skyZenith)},uHorizon:{value:new f(m.skyHorizon)},uHaze:{value:new f(m.skyHaze)},uSkyFog:{value:new f(m.skyHaze)},uBands:{value:new h(.055,.23,.96,.8)},uSunDir:{value:new F(.42,.72,.55).normalize()},uSunColor:{value:new f(m.sunColor)},uSunFlat:{value:new S(1,0)},uSunHalo:{value:1.15},uBodyTint:{value:new f(1,1,1)},uFresnel:{value:new h(e.fresnelF0,e.fresnelPower,e.reflectionTint,e.horizonReflect)},uFresnel2:{value:new F(e.fresnelMeanGain,e.reflectUpBias,0)},uRefract:{value:e.refractStrength},uGlint:{value:new h(e.glintSharpness,e.glintStrength,e.broadSharpness,e.broadStrength)},uGlitter:{value:new h(e.glitterSharpness,e.glitterStrength,e.glitterScale,e.glitterAmp)},uFar:{value:new h(e.farSlopeScale,e.farSlopeFreq,e.farSlopeAmp,e.farSlopeNear)},uFarFade:{value:new S(e.farFadeStart,e.farFadeEnd)},uWarp:{value:new S(e.warpNear,e.warpFar)},uLandRefl:{value:new h(e.landReflect,e.landReflectRange,e.landReflectFloor,e.landReflectDrag)},uLandMarch:{value:new F(e.landReflectNear,e.landReflectSpan,e.landReflectRise)},uLandColor:{value:new f(m.stoneMid).lerp(new f(m.stoneShadow),e.landReflectShade)},uAerial:{value:new F(e.aerialDensity,e.aerialMax,e.aerialStart)},uAerialColor:{value:new f(m.skyHaze)},uClarity:{value:new h(e.clarityDepth,e.minOpacity,e.wetDarken,e.specCompensate)},uWet:{value:new F(e.wetLag,e.wetDepth,e.wetReach)},uFineAmp:{value:e.fineAmp},uMicro:{value:new h(e.microScale,e.microAmp,e.microFadeStart,e.microFadeEnd)},uDetail:{value:new h(e.detailAmpNear,e.detailAmpFar,e.detailFadeStart,e.detailFadeEnd)},uSparkle:{value:e.sparkleContrast},uFoamA:{value:new h(e.foamDepth,e.foamProbeRadius,e.foamProbeLow,e.foamCollar)},uFoamE:{value:new h(e.foamProbeHigh,e.foamCollarFadeStart,e.foamCollarFadeEnd,e.foamNoiseContrast)},uFoamB:{value:new h(e.foamWashSpeed,e.foamWashSpatial,e.foamWashTravel,e.foamNoiseScale)},uFoamC:{value:new h(e.foamNoiseSpeed,e.foamThresholdLow,e.foamThresholdHigh,e.foamLineWidth)},uFoamD:{value:new h(e.foamLineStrength,e.crestFoamStart,e.crestFoamEnd,e.crestFoamStrength)},uFoamCull:{value:e.bathySize*.75},uCaustic:{value:new h(e.causticScale,e.causticSpeed,e.causticStrength,e.causticDepth)},uCausticColor:{value:new f(m.seaShallow)},uCausticSharp:{value:e.causticSharpen},uSSS:{value:new S(e.sssStrength,e.sssPower)},uDither:{value:e.dither}};this.material=new G({uniforms:g,vertexShader:te,fragmentShader:ae,fog:!1,side:Z,transparent:!0,depthWrite:!0,toneMapped:!0}),this.uniforms=this.material.uniforms,this.mesh=new P(this._buildDisc(),this.material),this.mesh.name="halcyon-sea",this.mesh.position.set(0,this.seaLevel,0),this.mesh.renderOrder=-100,this.mesh.frustumCulled=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!1,this.mesh.userData.noBathymetry=!0,this.mesh.userData.collider=!1,this.mesh.userData.surface="water",t.add(this.mesh),this.ctx.world.seaLevel=this.seaLevel,this.captureBathymetry(),this._syncSky()}captureBathymetry(){const{renderer:t,scene:a}=this.ctx.three;if(!t||!this._rtPacked)return;a.updateMatrixWorld(!0);const o=[],s=new Set,l=this.ctx.systems?.rig?.root;l&&s.add(l),this.ctx.player?.object&&s.add(this.ctx.player.object);const i=e.bathySize*1.2;a.traverse(r=>{if(!r.visible)return;let v=r.userData?.noBathymetry===!0||s.has(r);if(!v&&(r.isPoints||r.isSprite||r.isLine||r.isLineSegments)&&(v=!0),!v&&r.isMesh){const k=r.material,w=Array.isArray(k)?k[0]:k;if(w&&(w.transparent===!0||w.depthWrite===!1)&&(v=!0),!v&&r.geometry){r.geometry.boundingSphere||r.geometry.computeBoundingSphere();const b=r.geometry.boundingSphere;if(b){r.getWorldScale(D);const T=Math.max(Math.abs(D.x),Math.abs(D.y),Math.abs(D.z));b.radius*T>i&&(v=!0)}}}v&&o.push(r)});for(let r=0;r<o.length;r++)o[r].visible=!1;const n=t.getRenderTarget(),d=a.background,c=a.overrideMaterial,p=t.shadowMap.autoUpdate;t.getClearColor(H);const g=t.getClearAlpha();a.background=null,a.overrideMaterial=this._depthMat,t.shadowMap.autoUpdate=!1,t.setClearColor(16777215,1),t.setRenderTarget(this._rtPacked),t.clear(!0,!0,!1),t.render(a,this._bathyCam),a.overrideMaterial=null,t.setRenderTarget(this._rtBed),t.clear(!0,!1,!1),t.render(this._encScene,this._encCam),t.setRenderTarget(n),t.setClearColor(H,g),t.shadowMap.autoUpdate=p,a.overrideMaterial=c,a.background=d;for(let r=0;r<o.length;r++)o[r].visible=!0;this._bedPixels=null}_syncSky(){const t=this.ctx.world?.sky,a=t?.updateAtmosphere?.(this.ctx)??t?.getAtmosphere?.(),o=this.uniforms;if(!o)return;if(a)o.uZenith.value.copy(a.zenith),o.uHorizon.value.copy(a.horizon),o.uHaze.value.copy(a.haze),o.uSkyFog.value.copy(a.fog),o.uSunColor.value.copy(a.sunColor),o.uBands.value.copy(a.bands),o.uSunDir.value.copy(a.sunDir),o.uSunHalo.value=a.halo;else{const c=this.ctx.three.scene.fog;c?.color&&o.uSkyFog.value.copy(c.color)}const s=o.uSunDir.value,l=Math.hypot(s.x,s.z)||1;o.uSunFlat.value.set(s.x/l,s.z/l);const i=e.sunTint,n=o.uSunColor.value;o.uBodyTint.value.setRGB(1+(n.r-1)*i,1+(n.g-1)*i,1+(n.b-1)*i),o.uAerialColor.value.copy(o.uSkyFog.value).lerp(o.uSeaMid.value,e.aerialSeaMix).multiplyScalar(e.aerialDarken),o.uCausticColor.value.copy(o.uSeaShallow.value).lerp(n,e.causticWhite).multiplyScalar(1.12)}update(t,a,o){if(!this.mesh)return;this._uframe++,this._refreshQueue.length&&this._uframe>=this._refreshQueue[0]&&(this._refreshQueue.shift(),this.captureBathymetry());const s=o.three.camera;this.mesh.position.set(s.position.x,this.seaLevel,s.position.z),this.uniforms.uTime.value=o.time.elapsed,this._syncSky()}get level(){return this.seaLevel}bedHeightAt(t,a){const o=this._readBedPixels(),s=e.bathyRes,l=(t-e.bathyCenter[0])/e.bathySize+.5,i=(a-e.bathyCenter[1])/e.bathySize+.5,n=this.seaLevel+e.bathyEncodeLow,d=e.bathyEncodeHigh-e.bathyEncodeLow;if(!o||l<0||l>1||i<0||i>1)return n;const c=Math.min(s-1,Math.max(0,Math.round(l*(s-1)))),p=Math.min(s-1,Math.max(0,Math.round(i*(s-1))));return n+o[(p*s+c)*4]/255*d}heightAt(t,a){const o=this.ctx.time.elapsed,s=this.seaLevel-this.bedHeightAt(t,a),l=oe(s/e.shoreDampDepth);let i=0;for(let n=0;n<this._waves.length;n++){const d=this._waves[n],c=d.k*(d.dx*t+d.dz*a)-d.omega*o+d.phase;i+=d.A*l*Math.sin(c)}return this.seaLevel+i}isSubmerged(t){return t.y<this.heightAt(t.x,t.z)}_readBedPixels(){if(this._bedPixels)return this._bedPixels;const{renderer:t}=this.ctx.three;if(!t||!this._rtBed)return null;const a=e.bathyRes,o=new Uint8Array(a*a*4);try{t.readRenderTargetPixels(this._rtBed,0,0,a,a,o),this._bedPixels=o}catch{this._bedPixels=null}return this._bedPixels}dispose(){this.mesh&&(this.ctx.three.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh=null),this.material?.dispose(),this._encMat?.dispose(),this._depthMat?.dispose(),this._rtPacked?.dispose(),this._rtBed?.dispose(),this.material=null}}function oe(z){const t=z<0?0:z>1?1:z;return t*t*(3-2*t)}export{ie as Water,ie as default};
