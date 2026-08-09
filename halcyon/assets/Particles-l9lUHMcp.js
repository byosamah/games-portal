import{v as De,V as N,e as Pt,b as Te,W as gt,w as Ee,I as Re,B as ot,x as k,y as D,j as Me,z as Nt,O as Jt,F as Vt,H as Xt,K as Le,D as Ut,N as Bt,l as Ht,U as Ie}from"./main-BM5PwmOq.js";const{JUICE:ze,BUDGET:Oe,PALETTE:et,LIGHTING:Yt}=De,b=ze?.fx??{},wt=b?.presets??{},w=b?.emitters??{},j=Math.PI*2,W=35,yt=0,Y=1,vt=2,it=3,J=4,st=5,K=6,rt=7,ht=8,Kt=9,Zt=10,Qt=11,_t=12,$t=13,te=14,lt=15,xt=16,ee=17,ie=18,se=19,ae=20,oe=21,ne=22,re=23,he=24,le=25,ce=26,de=27,fe=28,pe=29,ue=30,bt=31,me=32,ge=33,Ct=34,L=32,Z=0,Q=1,$=2,ct=3,dt=4,ft=5,tt=6,at=7,pt=8,Ft=9,ut=10,St=11,At=12,we=13,ye=14,ve=15,Rt=16,Mt=17,kt=18,_e=19,xe=20,be=21,Ce=22,Fe=23,Dt=24,Tt=25,Et=26,Lt=27,It=28,zt=29,Ot=30,Se=31,A=G=>G<0?0:G>1?1:G,Pe=`
attribute vec3 iPos;
attribute vec2 iSize;
attribute vec3 iColor;
attribute vec4 iData;      // x alpha, y rotation, z shape + 16*groundAligned, w seed
// Normalised age, 0 at birth and 1 at death. The fragment shader needs it
// because DISPERSAL IS A SHAPE CHANGE, not an opacity change: real dust loses
// coverage from the edge inward as it dies, and a sprite that only fades keeps
// its full silhouette all the way to zero, which is what reads as "a decal
// being switched off".
attribute float iLife;

uniform float uFogDensity;
// x near fade start, y near fade end (metres),
// z screen clamp start, w screen clamp end (NDC half-height fraction)
uniform vec4 uClamp;

varying vec2 vUv;
varying vec3 vCol;
varying float vAlpha;
varying float vShape;
varying float vSeed;
varying float vFog;
varying float vLife;
varying vec3 vRight;
varying vec3 vUpAxis;
varying vec3 vFwd;

void main() {
  vUv = uv;
  vCol = iColor;
  vSeed = iData.w;
  vLife = iLife;

  float packed = iData.z;
  float ground = floor(packed / 16.0);
  vShape = packed - ground * 16.0;

  float c = cos(iData.y);
  float s = sin(iData.y);
  vec2 q = position.xy;
  vec2 r = vec2(q.x * c - q.y * s, q.x * s + q.y * c) * iSize;

  // Rows of the view matrix's rotation block are the camera basis in world
  // space. Cheaper and more robust than passing them in as uniforms.
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 upv   = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  vec3 fwd   = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);

  vec3 wp;
  if (ground < 0.5) {
    wp = iPos + right * r.x + upv * r.y;
    vRight = right; vUpAxis = upv; vFwd = fwd;
  } else {
    // Lying in the XZ plane. Its fake normal points at the sky, which is
    // exactly how ground smoke is lit, and a quad IN the floor cannot be cut
    // by the floor at any camera angle.
    wp = iPos + vec3(r.x, 0.0, r.y);
    vRight = vec3(1.0, 0.0, 0.0);
    vUpAxis = vec3(0.0, 0.0, 1.0);
    vFwd = vec3(0.0, 1.0, 0.0);
  }

  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float dist = max(-mv.z, 0.02);

  // -------------------------------------------------------------------------
  // THE SCREEN CLAMP. This is the whole fix for the full frame wash, and it has
  // to live here because the projected size is only knowable after the view
  // transform. projectionMatrix[1][1] is cot(fov/2), so this is the sprite's
  // half-height as a fraction of the viewport's half-height: 1.0 means it
  // covers the screen top to bottom. Anything approaching that is faded out,
  // and a second term fades anything that gets close to the lens. An effect can
  // no longer become a full screen filter no matter what the preset asks for.
  // -------------------------------------------------------------------------
  // Ground aligned decals are exempt from the size term: a quad lying IN the
  // floor is foreshortened into it and cannot become a screen filter, and
  // clamping it would erase the very mark an impact is supposed to leave.
  float halfSz = 0.5 * max(iSize.x, iSize.y);
  float ndcR = halfSz * projectionMatrix[1][1] / dist;
  float scrFade = mix(1.0 - smoothstep(uClamp.z, uClamp.w, ndcR), 1.0, ground);
  float nearFade = smoothstep(uClamp.x, uClamp.y, dist);
  vAlpha = iData.x * scrFade * nearFade;

  float fd = dist * uFogDensity;
  vFog = 1.0 - exp(-fd * fd);
  gl_Position = projectionMatrix * mv;
}
`,Ne=`
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uShadeColor;
uniform vec3 uFogColor;
uniform float uBackLight;
uniform float uRimLight;
uniform float uGlow;       // 0 = lit soft layer, >0 = emissive layer (max blend)

varying vec2 vUv;
varying vec3 vCol;
varying float vAlpha;
varying float vShape;
varying float vSeed;
varying float vFog;
varying float vLife;
varying vec3 vRight;
varying vec3 vUpAxis;
varying vec3 vFwd;

/**
 * One spike of a flare: a hard edged needle that tapers to a point, antialiased
 * over exactly one pixel using the screen space derivative of its own edge
 * distance. That last part is why a flare stays CRISP at four pixels across as
 * well as at four hundred - a fixed fraction smoothstep turns every small
 * sprite into a soft blob, which is the "low frequency mush" read.
 */
float spike(vec2 q, float len, float wid) {
  // No early return, and that is deliberate: 'fwidth' inside non uniform
  // control flow is undefined, and half the neighbours of a spike fragment are
  // outside the spike. The mask is applied as a multiply instead.
  float t = clamp(q.y / len, 0.0, 1.0);
  float w = wid * (1.0 - t) * (1.0 - t * 0.55);
  float d = abs(q.x) / max(w, 1e-4);
  float aa = max(fwidth(d) * 1.1, 0.03);
  float body = 1.0 - smoothstep(1.0 - aa, 1.0, d);
  return body * step(0.0, q.y) * step(q.y, len);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float ang = atan(p.y, p.x);
  float sid = vShape;
  float sd = vSeed * 6.2831853;

  float a = 0.0;
  float core = 0.0;   // how "solid" this fragment is, drives the shading
  float facet = 1.0;  // a hard shading break across a solid fragment
  float unlit = 0.0;  // 1 = draw vCol as authored, no sun, no sky

  if (sid < 0.5) {
    // -------------------------------------------------------------------------
    // PUFF, and the two defects this rewrite fixes, both of which were visible
    // at 3x zoom on the ground pound.
    //
    // 1. THE STRAIGHT EDGE. The old lobe ran 0.78 + 0.20 + 0.11 + 0.06 = up to
    //    1.15, and the boundary smoothstep only reached zero at d = 1.0, i.e.
    //    at r = 1.15. The quad's own half extent is 1.0. So along the middle of
    //    each quad EDGE the sprite was still at about 0.29 alpha when the
    //    geometry ran out, and the eye read the resulting hard horizontal cut
    //    as exactly what it was: a square. Every amplitude is now normalised so
    //    the widest possible lobe is 0.92, which leaves the falloff room to
    //    reach zero INSIDE the quad in every direction including the diagonals.
    //
    // 2. IT DID NOT DISPERSE. Fading a constant silhouette to zero is a decal
    //    being switched off. Real dust erodes: the boundary breaks up and the
    //    cloud loses coverage from the outside in while it also thins. The
    //    roughness term grows with age and eats the lobe, and the shoulder
    //    softens with it, so a dying puff is a ragged remnant, not a faint disc.
    // -------------------------------------------------------------------------
    float age = vLife;
    // -------------------------------------------------------------------------
    // A CLOUD IS A BLOB WITH AN IRREGULAR RIM. IT IS NOT A SNOWFLAKE.
    //
    // The lobe amplitudes here used to sum to 0.37 on a base of 0.78 - a radius
    // that swings by nearly fifty per cent around the circle - and at 5x zoom on
    // the traversal capture every single dust puff in the game was a tan STAR
    // with five sharp points. The reason it went unnoticed for three rounds is
    // that one starry puff at fifteen pixels reads as noise; eight of them
    // overlapping read as a snowflake pile.
    //
    // Total modulation is now under twelve per cent of the radius. Billowing
    // comes from many puffs of different sizes overlapping and from the
    // hemisphere shading below, which is where it comes from in real clouds -
    // not from carving the silhouette.
    // -------------------------------------------------------------------------
    float rough = 0.018 + 0.030 * age;
    float lob = 0.74
      + 0.052 * sin(ang * 3.0 + sd)
      + 0.032 * sin(ang * 5.0 - sd * 1.7)
      + rough * sin(ang * 8.0 + sd * 2.3 + age * 2.0);
    lob *= 1.0 - 0.18 * age * age;          // the remnant shrinks as it thins
    float d = r / max(lob, 0.06);
    // A wide solid core with a tight shoulder. A gaussian falloff is what makes
    // a pile of overlapping sprites average into one featureless smudge.
    float shoulder = mix(0.46, 0.20, age);  // ...and softens right out at the end
    a = 1.0 - smoothstep(shoulder, 1.0, d);
    a *= a * (3.0 - 2.0 * a);
    core = 1.0 - smoothstep(0.12, 1.0, d);
  } else if (sid < 1.5) {
    // ---- STAR: a soft anisotropic glint, for motes that are meant to twinkle
    // rather than to be read as a shape.
    float ax = exp(-abs(p.x) * 2.2) * exp(-abs(p.y) * 40.0);
    float ay = exp(-abs(p.y) * 2.2) * exp(-abs(p.x) * 40.0);
    float hot = exp(-r * r * 26.0);
    a = clamp(hot * 1.10 + (ax + ay) * 0.90, 0.0, 1.0);
    a *= 1.0 - smoothstep(0.10, 1.05, r);
    core = a;
  } else if (sid < 2.5) {
    // ---- FEATHER: a vane that tapers to a tip, a quill down the middle, and
    // barbs raked off the shaft. Reads as a feather at forty pixels.
    float t = clamp(p.y * 0.5 + 0.5, 0.0, 1.0);
    float w = 0.66 * sin(3.14159265 * pow(t, 0.68));
    float d = abs(p.x) / max(w, 1e-3);
    float vane = 1.0 - smoothstep(0.62, 1.0, d);
    float barb = 0.80 + 0.20 * sin(p.y * 17.0 + abs(p.x) * 9.0 + sd);
    float shaft = (1.0 - smoothstep(0.0, 0.085, abs(p.x))) * (1.0 - smoothstep(0.80, 1.0, abs(p.y)));
    a = clamp(vane * barb + shaft * 0.65, 0.0, 1.0) * (1.0 - smoothstep(0.90, 1.02, abs(p.y)));
    core = vane;
  } else if (sid < 3.5) {
    // ---- CHIP: a fragment of stone, softer than SHARD. Legacy.
    float lob = 0.74 + 0.19 * sin(ang * 2.0 + sd) + 0.13 * sin(ang * 3.0 - sd * 2.1);
    float d = r / lob;
    a = 1.0 - smoothstep(0.84, 1.0, d);
    core = 0.72 + 0.42 * smoothstep(-0.4, 0.6, p.y);
  } else if (sid < 4.5) {
    // ---- DROP: a round bulb with a tapering tail, i.e. water in flight.
    float k = clamp((p.y + 0.62) / 1.45, 0.0, 1.0);
    float w = 0.60 * (1.0 - k * k);
    float body = (1.0 - smoothstep(0.55, 1.0, abs(p.x) / max(w, 1e-3)))
               * (1.0 - smoothstep(0.84, 1.02, abs(p.y)));
    float bulb = 1.0 - smoothstep(0.24, 0.60, length(vec2(p.x, (p.y + 0.42) * 1.05)));
    a = clamp(max(body, bulb), 0.0, 1.0);
    core = a;
  } else if (sid < 5.5) {
    // ---- STREAK: a soft capsule along the quad's own y axis.
    float dy = max(abs(p.y) - 0.48, 0.0);
    float d = length(vec2(p.x, dy)) / 0.52;
    a = 1.0 - smoothstep(0.18, 1.0, d);
    core = a;
  } else if (sid < 6.5) {
    // ---- DISC: a flat sheet of foam. Mottled, so it never reads as a decal.
    float mott = 0.70 + 0.30 * sin(ang * 6.0 + sd) * sin(r * 8.0 - sd * 1.3);
    a = clamp((1.0 - smoothstep(0.66, 1.0, r)) * mott, 0.0, 1.0);
    core = a;
  } else if (sid < 7.5) {
    // -------------------------------------------------------------------------
    // SHARD: a piece of the floor. It has to be SOLID and it has to be CONVEX.
    //
    // The old version stepped a per-SECTOR radius, which makes the boundary
    // jump at every sector join, and with the pull swinging 0.58 to 1.02 those
    // jumps were larger than the radius itself. Captured on the ground pound at
    // 3x, the debris were little brown five pointed STARS - asterisks, not
    // stone. The intersection of five half planes is a genuine convex polygon
    // and cannot do that whatever the offsets are.
    // -------------------------------------------------------------------------
    float d = 0.0;
    for (int k = 0; k < 5; k++) {
      float phi = float(k) * 1.2566371 + sd;
      float off = 0.80 + 0.14 * sin(float(k) * 2.7 + sd * 3.1);
      d = max(d, dot(p, vec2(cos(phi), sin(phi))) / off);
    }
    float aaw = max(fwidth(d) * 1.1, 0.012);
    a = 1.0 - smoothstep(1.0 - aaw, 1.0, d);
    // Two flat faces meeting on a hard line: the single cheapest cue that a
    // sprite is a solid with a volume rather than a stamp with a shape.
    float fx = cos(sd * 1.7), fy = sin(sd * 1.7);
    facet = mix(0.34, 1.14, step(0.0, p.x * fx + p.y * fy + 0.18));
    facet += 0.34 * (1.0 - smoothstep(0.0, aaw * 4.0, 1.0 - d)) * step(0.0, p.y);
    core = 1.0;
  } else if (sid < 8.5) {
    // ---- SCUFF: the mark left on the floor. Unlit by construction: it is a
    // shadow, and a shadow the sun makes brighter is not a shadow. The boundary
    // is SCALLOPED with scour spokes radiating out of it, which is the
    // difference between "the floor was hit here" and a blob shadow.
    float lob = 0.88 + 0.07 * sin(ang * 3.0 + sd) + 0.05 * sin(ang * 5.0 - sd * 1.7);
    float spokes = 0.70 + 0.30 * pow(abs(sin(ang * 6.0 + sd * 3.1)), 0.55);
    float d = r / max(lob * spokes, 1e-3);
    float k = 1.0 - smoothstep(0.06, 1.0, d);
    a = pow(clamp(k, 0.0, 1.0), 1.25);
    core = a;
    unlit = 1.0;
  } else if (sid < 9.5) {
    // ---- FLARE: a hard four point star with four short diagonals and a tight
    // hot core. This is the shape the reference gives a collectible, and it is
    // a SHAPE - straight needles with a defined edge - rather than a bright
    // blob relying on the bloom radius to be interesting. Because every needle
    // is antialiased off its own derivative it survives being small, which is
    // what a coin glint has to do.
    // Widths are a fraction of the sprite's own half extent, and the first
    // pass had them at 0.052 - which on the 0.30 m glints this preset library
    // actually uses is an EIGHT MILLIMETRE needle, four pixels at gameplay
    // range. Measured: fourteen flares alive in the signature frame and not
    // one of them visible. A flare has to have mass at the size it is drawn.
    float longLen = 1.02, longWid = 0.150;
    float diagLen = 0.50, diagWid = 0.105;
    float f = 0.0;
    f = max(f, spike(vec2(p.x, p.y), longLen, longWid));
    f = max(f, spike(vec2(p.x, -p.y), longLen, longWid));
    f = max(f, spike(vec2(p.y, p.x), longLen * 0.86, longWid));
    f = max(f, spike(vec2(p.y, -p.x), longLen * 0.86, longWid));
    const float K2 = 0.70710678;
    vec2 dg = vec2((p.x - p.y) * K2, (p.x + p.y) * K2);
    f = max(f, spike(vec2(dg.x, dg.y), diagLen, diagWid));
    f = max(f, spike(vec2(dg.x, -dg.y), diagLen, diagWid));
    f = max(f, spike(vec2(dg.y, dg.x), diagLen, diagWid));
    f = max(f, spike(vec2(dg.y, -dg.x), diagLen, diagWid));
    // A solid hot centre and a tight halo around it. The needles give the
    // shape; these two give it something to be attached to, and they are what
    // keeps a four pixel glint from being four disconnected pixels.
    float hot = exp(-r * r * 22.0);
    float halo = 0.30 * (1.0 - smoothstep(0.10, 0.62, r));
    a = clamp(f + hot + halo, 0.0, 1.0);
    core = a;
  } else {
    // -------------------------------------------------------------------------
    // ORB: a soft warm VOLUMETRIC glow, and it exists because a burst is a
    // stack, not a sprite.
    //
    // The reference's pickup is three layers read in one glance - a broad soft
    // warm bloom, a hard geometric ring inside it, and a sharp anisotropic star
    // on top - and ours was the star on its own. The star is the detail; this
    // is the light the detail is sitting in. Two nested falloffs (a wide body
    // and a tight heart) rather than one gaussian, because a single exponential
    // reads as a blurred dot, and a faint radial striation so it is a volume of
    // lit air instead of a gradient.
    // -------------------------------------------------------------------------
    float body = exp(-r * r * 3.1);
    float heart = exp(-r * r * 13.0);
    float striate = 0.86 + 0.14 * sin(ang * 12.0 + sd * 5.0);
    a = clamp((body * 0.72 + heart * 0.62) * striate, 0.0, 1.0);
    a *= 1.0 - smoothstep(0.72, 1.0, r);   // reach zero inside the quad
    core = a;
  }

  a *= vAlpha;
  if (a < 0.004) discard;

  vec3 col;
  if (uGlow > 0.5) {
    // -----------------------------------------------------------------------
    // THE EMISSIVE LAYER, AND THE STRUCTURAL DEFECT THAT MADE IT INVISIBLE.
    //
    // This material used to composite with MaxEquation over a PREMULTIPLIED
    // colour, which is a contradiction: premultiplying scales the fragment by
    // its own coverage, and MAX then throws away anything that does not already
    // beat the background. So every soft part of every glint - the needle tips,
    // the halo, the whole of a bead at half alpha - lost to a bright sky by
    // construction, and only a handful of near-solid centre pixels could ever
    // appear. Measured directly: at the triple jump apex the pools held 43 soft
    // and 24 glow live particles and the captured frame contained NONE of them.
    // The airborne half of this piece was not missing, it was arithmetically
    // unable to draw itself.
    //
    // It is now premultiplied OVER: src + dst*(1-srcAlpha). That is ordinary
    // alpha compositing with the colour free to exceed 1.0, so a glint reads on
    // a white sky and on dark water alike, keeps its soft falloff, and - the
    // property MAX was chosen for in the first place - N overlapping glints
    // still converge on the sprite colour instead of summing to N times white.
    // The full frame wash cannot come back: over-compositing is bounded above
    // by the brightest single sprite, exactly as MAX was.
    // -----------------------------------------------------------------------
    col = vCol * a * (1.0 - vFog);
    gl_FragColor = vec4(col, a);
  } else if (unlit > 0.5) {
    // A ground mark. Its colour is the answer, not an input to a light model.
    col = mix(vCol, uFogColor, vFog);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  } else {
    // -----------------------------------------------------------------------
    // A HEMISPHERE NORMAL, AND THE TWO TERMS THAT MAKE A PUFF READ ON WHITE
    // STONE. This scene's sunlit paving sits at the white point of the image,
    // so a bright dust cloud on it is invisible. What reads is not brightness,
    // it is FORM: a sun facing top a little hotter than the ground and an
    // underside three stops below it, which is what a real dust cloud does.
    // -----------------------------------------------------------------------
    float w = sqrt(max(0.0, 1.0 - min(r * r, 1.0)));
    vec3 n = normalize(vRight * p.x + vUpAxis * p.y + vFwd * w);
    float ndl = dot(n, uSunDir);
    float key = pow(clamp(ndl * 0.5 + 0.5, 0.0, 1.0), 0.80);
    float sky = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
    col = vCol * (uSunColor * key + uShadeColor * (0.30 + 0.70 * sky));
    // Thin media are translucent: a puff with the sun behind it glows at the
    // edge, which is what stops back lit dust reading as a hole.
    col += vCol * uSunColor * (uBackLight * smoothstep(0.30, 1.0, r) * clamp(-ndl, 0.0, 1.0));
    // ...and a grazing highlight along the sun facing edge, which is the only
    // thing that draws the boundary of one puff against the next one behind it.
    col += vCol * uSunColor * (uRimLight * smoothstep(0.42, 0.98, r) * clamp(ndl, 0.0, 1.0));
    col *= mix(1.0, core, 0.22);   // the thin skirt of a puff is thinner light
    col *= facet;                  // ...and a solid fragment has flat faces
    col = mix(col, uFogColor, vFog);
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Ue=`
attribute vec3 iCenter;
attribute vec4 iAxis;      // xyz axis, w spin
attribute vec4 iRing;      // x radius, y half width, z alpha, w seed
attribute vec3 iColor;     // the outer lip: tinted by the surface, transparent
attribute vec3 iCore;      // the hot middle of the band
attribute vec4 iArc;       // x arc centre, y arc half sweep, z taper power, w flat

uniform float uFogDensity;
uniform vec4 uClamp;

varying float vBand;
varying vec3 vCol;
varying vec3 vCore;
varying float vAlpha;
varying float vFog;

void main() {
  // The position attribute carries (angle 0..1, band 0..1, 0). Packing the
  // parametrisation into the vertex position keeps the geometry to one buffer.
  float th = position.x * 6.2831853 + iAxis.w;
  vBand = position.y;
  vCol = iColor;
  vCore = iCore;

  vec3 n = normalize(iAxis.xyz);
  vec3 t = abs(n.y) < 0.985 ? normalize(cross(n, vec3(0.0, 1.0, 0.0))) : vec3(1.0, 0.0, 0.0);
  vec3 b = cross(n, t);

  // -------------------------------------------------------------------------
  // THE ARC WINDOW. A closed loop of uniform width around a character is a
  // rubber band - it was measured crossing the chin in the signature frame.
  // The same band, opened into a crescent whose width and alpha both fall to
  // nothing towards its ends, is a motion arc: it has a head, a direction and
  // a tail, and it can be pointed away from the silhouette. A half sweep at or
  // above PI means "closed ring", and then nothing tapers.
  // -------------------------------------------------------------------------
  float rel = th - iArc.x;
  rel = atan(sin(rel), cos(rel));                    // wrap to [-PI, PI]
  float k = 1.0 - clamp(abs(rel) / max(iArc.y, 1e-3), 0.0, 1.0);
  float closed = step(3.14159, iArc.y);
  float taper = mix(pow(k, max(iArc.z, 0.01)), 1.0, closed);

  vAlpha = iRing.z * taper;

  // A perfectly circular front is a hoop; a wobbled one is a wave. The wobble
  // is measured in BAND WIDTHS, never in radii, or the ring stops being a ring
  // and photographs as a length of dropped rope.
  //
  // 0.22 and 0.12, not 0.42 and 0.24. On a thin front the old pair swung the
  // radius by two thirds of the band width, so the band no longer overlapped
  // itself from one segment to the next and the ring photographed as a wavy
  // CHALK OUTLINE drawn on the paving rather than as a front moving through it.
  float wob = 0.22 * sin(th * 5.0 + iRing.w * 12.0)
            + 0.12 * sin(th * 9.0 - iRing.w * 7.0);

  float halfW = iRing.y * taper;
  float rad = iRing.x + (position.y - 0.5 + wob * 0.28) * 2.0 * halfW;
  vec3 wp = iCenter + (t * cos(th) + b * sin(th)) * rad;
  // Lift the middle of the band along the axis ONLY when the ring is meant to
  // be a body in the air. A ground front that is lifted photographs as a glossy
  // torus lying on the plaza - measured, and the honest read of it was a soap
  // bubble with a specular highlight.
  wp += n * (1.0 - abs(position.y * 2.0 - 1.0)) * halfW * 0.6 * (1.0 - iArc.w);

  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float dist = max(-mv.z, 0.02);
  vAlpha *= smoothstep(uClamp.x, uClamp.y, dist);
  float fd = dist * uFogDensity;
  vFog = 1.0 - exp(-fd * fd);
  gl_Position = projectionMatrix * mv;
}
`,Be=`
uniform vec3 uFogColor;

varying float vBand;
varying vec3 vCol;
varying vec3 vCore;
varying float vAlpha;
varying float vFog;

/**
 * A SHOCK FRONT, NOT A PAINTED BAND.
 *
 * What was here made a scalloped band of near solid white and stopped it dead
 * at both lips: (core*0.94 + lip*0.80) is at 0.80 alpha where y = 0.93 and at
 * zero two per cent of the band later. On a cream limestone plaza that is white
 * on white with a hard edge round it, which is the honest description of the
 * captured pound - a decal switched on under the feet. The reference's impact
 * ring is a HOT LINE with a long soft skirt on the outside of it.
 *
 * So the across-band profile is now asymmetric on purpose:
 *
 *   inner lip -> a short ramp in. The compressed side is nearly square.
 *   core      -> a narrow hot line, well inboard of the leading edge.
 *   outer lip -> a LONG alpha ramp that reaches zero at the leading edge, so
 *                the front dissolves into the floor instead of being cut out
 *                of it. This is the term that was missing.
 *
 * vCol is the warm surface-tinted skirt and vCore the hot line, so the ring
 * is two colours across its width rather than one flat value - which is what
 * separates it from the paving without needing to be brighter than the paving.
 */
void main() {
  float y = vBand;                             // 0 inner lip, 1 outer lip

  float inner = smoothstep(0.00, 0.24, y);     // short ramp on the trailing side
  float outer = 1.0 - smoothstep(0.30, 1.00, y); // long ramp out to the front
  float body = clamp(inner * outer, 0.0, 1.0);

  // THE HOT LINE IS A LINE. A power of the band profile is not: pow(body,3.4)
  // sits at unity across most of the width, which is how a "hot core with a
  // warm falloff" photographed as a flat opaque white band on a cream plaza.
  // A narrow gaussian at 30% of the width is a filament: about a quarter of the
  // band is hot and three quarters of it is the warm skirt.
  float hot = exp(-pow((y - 0.30) / 0.115, 2.0));

  float a = clamp(body * 0.80 + hot * 0.26, 0.0, 1.0) * vAlpha;
  if (a < 0.004) discard;

  // Warm skirt -> hot filament. Mixed on the SQUARED term so the transition
  // happens over a few pixels and the ring has a bright line running through
  // it rather than being one flat value across its width.
  vec3 col = mix(vCol, vCore, hot * hot * 0.86 + hot * 0.14);
  col = mix(col, uFogColor, vFog);

  gl_FragColor = vec4(col, a);

  #include <colorspace_fragment>
}
`;class Ae{constructor(t,e,i){this.cap=t,this.count=0,this.data=new Float32Array(t*W),this.iPos=new Float32Array(t*3),this.iSize=new Float32Array(t*2),this.iColor=new Float32Array(t*3),this.iData=new Float32Array(t*4),this.iLife=new Float32Array(t);const s=new Re;s.setAttribute("position",new ot(new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0]),3)),s.setAttribute("uv",new ot(new Float32Array([0,0,1,0,1,1,0,1]),2)),s.setIndex(new ot(new Uint16Array([0,1,2,0,2,3]),1)),this.aPos=new k(this.iPos,3).setUsage(D),this.aSize=new k(this.iSize,2).setUsage(D),this.aColor=new k(this.iColor,3).setUsage(D),this.aData=new k(this.iData,4).setUsage(D),this.aLife=new k(this.iLife,1).setUsage(D),s.setAttribute("iPos",this.aPos),s.setAttribute("iSize",this.aSize),s.setAttribute("iColor",this.aColor),s.setAttribute("iData",this.aData),s.setAttribute("iLife",this.aLife),s.instanceCount=0,s.boundingSphere=new Me(new N,1e6),this.geometry=s;const o={uniforms:i,vertexShader:Pe,fragmentShader:Ne,transparent:!0,depthWrite:!1,depthTest:!0,side:Ut,fog:!1};this.material=new Nt(e?{...o,blending:Le,blendEquation:Xt,blendSrc:Vt,blendDst:Jt,blendEquationAlpha:Xt,blendSrcAlpha:Vt,blendDstAlpha:Jt,toneMapped:!1}:{...o,blending:Bt,toneMapped:!0}),this.mesh=new Ht(s,this.material),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!1,this.mesh.userData.noShadow=!0,this.mesh.userData.noBathymetry=!0,this.mesh.userData.collider=!1}dispose(){this.mesh.parent?.remove(this.mesh),this.geometry.dispose(),this.material.dispose()}}class He{constructor(t,e,i=96){this.cap=t,this.count=0,this.data=new Float32Array(t*L),this.iCenter=new Float32Array(t*3),this.iAxis=new Float32Array(t*4),this.iRing=new Float32Array(t*4),this.iColor=new Float32Array(t*3),this.iCore=new Float32Array(t*3),this.iArc=new Float32Array(t*4);const s=new Float32Array((i+1)*2*3),o=new Uint16Array(i*6);for(let n=0;n<=i;n++){const h=n/i;s[n*6+0]=h,s[n*6+1]=0,s[n*6+2]=0,s[n*6+3]=h,s[n*6+4]=1,s[n*6+5]=0}for(let n=0;n<i;n++){const h=n*2,l=h+1,c=h+2,d=h+3;o[n*6+0]=h,o[n*6+1]=l,o[n*6+2]=c,o[n*6+3]=l,o[n*6+4]=d,o[n*6+5]=c}const a=new Re;a.setAttribute("position",new ot(s,3)),a.setIndex(new ot(o,1)),this.aCenter=new k(this.iCenter,3).setUsage(D),this.aAxis=new k(this.iAxis,4).setUsage(D),this.aRing=new k(this.iRing,4).setUsage(D),this.aColor=new k(this.iColor,3).setUsage(D),this.aCore=new k(this.iCore,3).setUsage(D),this.aArc=new k(this.iArc,4).setUsage(D),a.setAttribute("iCenter",this.aCenter),a.setAttribute("iAxis",this.aAxis),a.setAttribute("iRing",this.aRing),a.setAttribute("iColor",this.aColor),a.setAttribute("iCore",this.aCore),a.setAttribute("iArc",this.aArc),a.instanceCount=0,a.boundingSphere=new Me(new N,1e6),this.geometry=a,this.material=new Nt({uniforms:e,vertexShader:Ue,fragmentShader:Be,transparent:!0,depthWrite:!1,depthTest:!0,blending:Bt,side:Ut,toneMapped:!1,fog:!1}),this.mesh=new Ht(a,this.material),this.mesh.frustumCulled=!1,this.mesh.matrixAutoUpdate=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!1,this.mesh.userData.noShadow=!0,this.mesh.userData.noBathymetry=!0,this.mesh.userData.collider=!1}dispose(){this.mesh.parent?.remove(this.mesh),this.geometry.dispose(),this.material.dispose()}}const We=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,Ge=`
uniform vec3 uColor;
uniform float uAlpha;
uniform float uSoft;     // 0 = a hard cut edge, 1 = a wide penumbra
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  // A real contact shadow has a dark, flat core and a penumbra that widens with
  // distance from the occluder. Both terms move together off one uniform, which
  // is what makes the mark a LANDING PREDICTOR: it tightens and darkens as the
  // body drops, so the player reads their own altitude off the floor.
  float a = 1.0 - smoothstep(1.0 - uSoft, 1.0, r);
  a = pow(clamp(a, 0.0, 1.0), 0.70);
  a *= uAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;class qe{constructor(t){const e=new Ie(1,1);e.rotateX(-Math.PI/2),this.material=new Nt({uniforms:{uColor:{value:new Pt(t)},uAlpha:{value:0},uSoft:{value:.4}},vertexShader:We,fragmentShader:Ge,transparent:!0,depthWrite:!1,depthTest:!0,blending:Bt,side:Ut,toneMapped:!0,fog:!1}),this.mesh=new Ht(e,this.material),this.mesh.frustumCulled=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!1,this.mesh.renderOrder=26,this.mesh.name="halcyon-fx-contact-shadow",this.mesh.visible=!1,this.mesh.userData.noShadow=!0,this.mesh.userData.noBathymetry=!0,this.mesh.userData.collider=!1,this.geometry=e}dispose(){this.mesh.parent?.remove(this.mesh),this.geometry.dispose(),this.material.dispose()}}class Je{constructor(t){this.ctx=t,this.enabled=b?.enabled!==!1,this._ready=!1,this._offs=[];const e=Math.max(240,Oe?.maxActiveParticles|0||3e3);this.softCap=Math.max(64,Math.round(e*(b.poolSoftFraction??.55))),this.glowCap=Math.max(32,Math.round(e*(b.poolGlowFraction??.3))),this.ringCap=Math.max(8,b.poolRings??40);const i=this.softCap+this.glowCap+this.ringCap;if(i>e){const s=e/i;this.softCap=Math.max(32,Math.floor(this.softCap*s)),this.glowCap=Math.max(16,Math.floor(this.glowCap*s)),this.ringCap=Math.max(6,Math.floor(this.ringCap*s))}this._lastElapsed=0,this._seedFrame=-1,this._seedOrder=0,this._rndState=1,this._baseSeed=(t?.rng?.seed??1592631582)>>>0||1,this._lastFootstepFrame=-999,this._airFrames=0,this._sinceJump=9999,this._apexFired=!0,this._spinFired=!0,this._wasSlamming=!1,this._shadowDrop=-1,this._rayO=new N,this._rayD=new N(0,-1,0),this._pos=new N,this._vel=new N,this._recent=new Float32Array(40).fill(-1),this._recentName=new Array(8).fill(""),this._recentAt=0,this._tints=Object.create(null),this._colorCache=new Map,this._tmpCol=new Pt,this._gained=[0,0,0]}init(){const t=this.ctx,e=t?.three?.scene;if(!e||!this.enabled)return;this._buildColorTables();const i=this._linear(b.shadeColor??et.skyBounce),s=Yt?.timeline?.[2]?.sun??et.sunColor,o=this._linear(s),a=b.sunGain??1.34,n=b.shadeGain??.4;this._uSunDir=new N(.4,.7,-.55).normalize(),this._uSunColor=new N(o[0]*a,o[1]*a,o[2]*a),this._uShadeColor=new N(i[0]*n,i[1]*n,i[2]*n),this._uFogColor=new Pt(et.skyHaze),this._sunGain=a;const h=b.clamp??{};this._uClamp=new Te(h.nearFadeStart??.55,h.nearFadeEnd??1.45,h.screenStart??.34,h.screenEnd??.62);const l={uSunDir:{value:this._uSunDir},uSunColor:{value:this._uSunColor},uShadeColor:{value:this._uShadeColor},uFogColor:{value:this._uFogColor},uFogDensity:{value:Yt?.fogDensity??.0036},uBackLight:{value:b.backLight??.42},uRimLight:{value:b.rimLight??.5},uClamp:{value:this._uClamp},uGlow:{value:0}},c={uSunDir:l.uSunDir,uSunColor:l.uSunColor,uShadeColor:l.uShadeColor,uFogColor:l.uFogColor,uFogDensity:l.uFogDensity,uBackLight:l.uBackLight,uRimLight:l.uRimLight,uClamp:l.uClamp,uGlow:{value:1}},d={uFogColor:l.uFogColor,uFogDensity:l.uFogDensity,uClamp:l.uClamp};this.soft=new Ae(this.softCap,!1,l),this.glow=new Ae(this.glowCap,!0,c),this.rings=new He(this.ringCap,d);const u=b.contactShadow??{};u.enabled!==!1&&(this.contact=new qe(u.color??et.stoneDeepShadow),e.add(this.contact.mesh)),this.soft.mesh.renderOrder=30,this.glow.mesh.renderOrder=32,this.rings.mesh.renderOrder=31,this.soft.mesh.name="halcyon-fx-soft",this.glow.mesh.name="halcyon-fx-glow",this.rings.mesh.name="halcyon-fx-rings",e.add(this.soft.mesh,this.rings.mesh,this.glow.mesh),this._lastElapsed=t.time?.elapsed??0,this._ready=!0,this._subscribe(),t.fx&&(t.fx.particleCount=0,t.fx.particleCapacity=this.softCap+this.glowCap+this.ringCap),typeof globalThis<"u"&&(globalThis.__HALCYON_FX__={state:()=>this.diagnostics()})}diagnostics(){const t=this.contact;return{soft:this.soft?.count??0,glow:this.glow?.count??0,rings:this.rings?.count??0,caps:[this.softCap,this.glowCap,this.ringCap],shadow:{drop:+(this._shadowDrop??-1).toFixed(3),visible:!!t?.mesh?.visible,alpha:+(t?.material?.uniforms?.uAlpha?.value??0).toFixed(3),soft:+(t?.material?.uniforms?.uSoft?.value??0).toFixed(3),pos:t?t.mesh.position.toArray().map(e=>+e.toFixed(2)):null,radius:t?+(t.mesh.scale.x*.5).toFixed(3):0},ringDump:this._ringDump(),glowDump:this._fieldDump(this.glow,10),softDump:this._fieldDump(this.soft,6),airFrames:this._airFrames,sinceJump:this._sinceJump,apexFired:this._apexFired}}_fieldDump(t,e){if(!t)return[];const i=[],s=Math.min(e,t.count);for(let o=t.count-s;o<t.count;o++)i.push({p:[+t.iPos[o*3].toFixed(2),+t.iPos[o*3+1].toFixed(2),+t.iPos[o*3+2].toFixed(2)],s:[+t.iSize[o*2].toFixed(3),+t.iSize[o*2+1].toFixed(3)],c:[+t.iColor[o*3].toFixed(2),+t.iColor[o*3+1].toFixed(2),+t.iColor[o*3+2].toFixed(2)],a:+t.iData[o*4].toFixed(3),shape:t.iData[o*4+2],t:+t.iLife[o].toFixed(2)});return i}_ringDump(){const t=this.rings;if(!t)return[];const e=t.data,i=[];for(let s=0;s<t.count;s++){const o=s*L;i.push({c:[+e[o+Z].toFixed(2),+e[o+Q].toFixed(2),+e[o+$].toFixed(2)],n:[+e[o+ct].toFixed(2),+e[o+dt].toFixed(2),+e[o+ft].toFixed(2)],t:+(e[o+tt]/e[o+at]).toFixed(2),r:[+e[o+pt].toFixed(2),+e[o+Ft].toFixed(2)],w:[+e[o+ut].toFixed(3),+e[o+St].toFixed(3)],a:+e[o+At].toFixed(2),arc:[+e[o+It].toFixed(2),+e[o+zt].toFixed(2),+e[o+Ot].toFixed(2)],lip:[+e[o+Rt].toFixed(2),+e[o+Mt].toFixed(2),+e[o+kt].toFixed(2)]})}return i}_subscribe(){const t=this.ctx?.signals;if(!t?.on)return;const e=(i,s)=>{const o=t.on(i,s);o&&this._offs.push(o)};e("player:land",i=>this._onLand(i)),e("player:jump",i=>this._onJump(i)),e("player:groundpound",i=>this._onPound(i)),e("player:walljump",i=>this._onWallJump(i)),e("player:footstep",i=>this._onFootstep(i)),e("bird:throw",i=>this._onBirdThrow(i)),e("bird:bounce",i=>this._onBirdBounce(i)),e("collect:sunstone",i=>this._onSunstone(i)),e("collect:coin",i=>this._onCoin(i)),e("enemy:defeat",i=>this._onDefeat(i))}spawn(t,e,i){if(!this._ready)return;const s=wt[t];if(!s)return;let o=0,a=0,n=0;if(e&&(typeof e.x=="number"?(o=e.x,a=e.y,n=e.z):e.length>=3&&(o=e[0],a=e[1],n=e[2])),!Number.isFinite(o)||!Number.isFinite(a)||!Number.isFinite(n)||this._isDuplicate(t,o,a,n))return;const h=Math.abs(i?.impactSpeed??i?.speed??0);let l=i?.intensity;if(l==null)if(s.intensityFrom==="impact"){const v=s.impactRange?.[0]??5,x=s.impactRange?.[1]??26;l=.22+.78*A((h-v)/Math.max(.001,x-v))}else i?.speed!=null?l=.55+.45*A(h/8.6):l=1;l=A(l);const c=this._tintFor(i?.surface);let d=i?.countScale??1;i?.count!=null&&(d=Math.min(2.5,Math.max(.2,i.count/10)));const u=Number.isFinite(i?.groundY)?i.groundY:a;let p=0,r=0,f=0;const y=i?.velocity??this.ctx?.player?.velocity;y&&typeof y.x=="number"&&(p=y.x,r=y.y,f=y.z),(!Number.isFinite(p)||!Number.isFinite(r)||!Number.isFinite(f))&&(p=r=f=0),this._seedBurst(t);const _=s.groups;if(_)for(let v=0;v<_.length;v++){const x=_[v];l<(x.minIntensity??0)||this._emitGroup(x,o,a,n,u,l,d,c,p,r,f)}const C=i?.rings===!1?null:s.rings;if(C){let v=i?.radius?i.radius/2.4:i?.scale??1;v>.6||(v=.6),v>1.15&&(v=1.15);for(let x=0;x<C.length;x++){const F=C[x];l<(F.minIntensity??0)||this._emitRing(F,o,a,n,l,v,c,i?.normal,p,r,f)}}}_emitGroup(t,e,i,s,o,a,n,h,l,c,d){const u=t.layer==="glow"?this.glow:this.soft,p=(.42+.58*a)*n;let r=t.fixedCount?Math.round(this._r2(t.count)):Math.round(this._r2(t.count)*p);if(r<=0)return;const f=.55+.45*a,y=.7+.3*a,_=this._rnd()*j,C=(t.shape|0)+(t.ground?16:0),v=t.inherit??0,x=this._resolveColor(t.color,h,t.gain),F=x[0],U=x[1],B=x[2],I=t.color2==null?x:this._resolveColor(t.color2,h,t.gain),z=I[0],R=I[1],O=I[2];let T=0,P=0,q=0;if(t.back){const E=Math.hypot(l,c,d);if(E>.2){const X=t.back/E;T=-l*X,P=-c*X,q=-d*X}}const V=t.alignTo==="velocity"?this._screenAngle(l,c,d):null,S=this.ctx?.player?.position,M=t.follow&&S?1:0;M&&(T-=S.x,P-=S.y,q-=S.z);for(let E=0;E<r;E++){const X=this._alloc(u);if(X<0)return;const m=u.data,g=X*W,H=t.even?_+E/r*j+(this._rnd()-.5)*(j/r)*.55:this._rnd()*j,Wt=this._r2(t.ring);m[g+yt]=e+T+Math.cos(H)*Wt,m[g+Y]=i+P+this._r2(t.yOff),m[g+vt]=s+q+Math.sin(H)*Wt;const Gt=this._r2(t.radial)*f,mt=t.jitter?this._r2(t.jitter):0,qt=t.tangent?this._r2(t.tangent)*f:0;m[g+it]=Math.cos(H)*Gt-Math.sin(H)*qt+(this._rnd()-.5)*2*mt+l*v,m[g+J]=this._r2(t.up)*f+(this._rnd()-.5)*mt+c*v*.35,m[g+st]=Math.sin(H)*Gt+Math.cos(H)*qt+(this._rnd()-.5)*2*mt+d*v,m[g+K]=0,m[g+rt]=Math.max(.03,this._r2(t.life)),m[g+ht]=o,m[g+Kt]=t.grav??0,m[g+Zt]=t.drag??0,m[g+Qt]=t.bounce??0;const ke=this._r2(t.size0)*y;m[g+_t]=ke,m[g+$t]=this._r2(t.size1)*y,m[g+te]=t.aspect?this._r2(t.aspect):1;let nt;V!=null?nt=V:t.alignTo==="tangent"?nt=this._screenAngle(-Math.sin(H),0,Math.cos(H)):nt=t.rot?this._r2(t.rot):this._rnd()*j,m[g+lt]=nt+(t.alignJitter?(this._rnd()-.5)*t.alignJitter:0),m[g+xt]=t.spin?this._r2(t.spin):0,m[g+ee]=this._r2(t.alpha);const jt=Math.min(.55,Math.max(.02,t.fadeIn??.1));m[g+ie]=jt,m[g+ge]=Math.min(.92,Math.max(jt,t.hold??0)),m[g+se]=F,m[g+ae]=U,m[g+oe]=B,m[g+ne]=z-F,m[g+re]=R-U,m[g+he]=O-B,m[g+le]=C,m[g+ce]=this._rnd(),m[g+de]=t.flutter?t.flutter[0]:0,m[g+fe]=t.flutter?t.flutter[1]:0,m[g+pe]=t.twinkle?t.twinkle[0]:0,m[g+ue]=t.twinkle?t.twinkle[1]:0,m[g+bt]=this._rnd()*j,m[g+me]=t.sit&&!M?1:0,m[g+Ct]=M}}_emitRing(t,e,i,s,o,a,n,h,l,c,d){const u=this.rings,p=this._allocRing();if(p<0)return;const r=u.data,f=p*L;let y=0,_=1,C=0;if(t.axis==="normal"&&h&&typeof h.x=="number"){const S=Math.hypot(h.x,h.y,h.z)||1;y=h.x/S,_=h.y/S,C=h.z/S}else if(t.axis==="camera"){const M=this.ctx?.three?.camera?.matrixWorld?.elements;if(M){const E=Math.hypot(M[8],M[9],M[10])||1;y=M[8]/E,_=M[9]/E,C=M[10]/E}}else if(t.tilt){const S=t.tilt;y=(this._rnd()-.5)*2*S,C=(this._rnd()-.5)*2*S;const M=Math.hypot(y,1,C);y/=M,_=1/M,C/=M}const v=t.scaleWithRadius===!1?1:a,x=1-(t.scaleWithIntensity??0)*(1-o);let F=0,U=0,B=0;const I=Math.hypot(l,c,d);if(t.back&&I>.2){const S=t.back/I;F=-l*S,U=-c*S,B=-d*S}r[f+Z]=e+F,r[f+Q]=i+U+(t.lift??.03),r[f+$]=s+B,r[f+ct]=y,r[f+dt]=_,r[f+ft]=C,r[f+tt]=0,r[f+at]=Math.max(.05,t.life??.3),r[f+pt]=(t.r?.[0]??.2)*v*x,r[f+Ft]=(t.r?.[1]??1.2)*v*x,r[f+ut]=(t.width?.[0]??.1)*.5*v,r[f+St]=(t.width?.[1]??.03)*.5*v,r[f+At]=(t.alpha??.7)*(.45+.55*o),r[f+we]=t.fadePow??1.5,r[f+ye]=t.rise??0,r[f+ve]=t.arcHalf?0:this._rnd()*j,r[f+Fe]=Math.min(.85,Math.max(0,t.hold??0));const z=this.ctx?.player?.position;t.follow&&z?(r[f+Dt]=1,r[f+Tt]=r[f+Z]-z.x,r[f+Et]=r[f+Q]-z.y,r[f+Lt]=r[f+$]-z.z):(r[f+Dt]=0,r[f+Tt]=0,r[f+Et]=0,r[f+Lt]=0);const R=t.arcHalf??Math.PI;r[f+zt]=R,r[f+Ot]=t.arcTaper??1,r[f+Se]=t.bulge?0:1,r[f+It]=R>=Math.PI?0:this._arcAngle(t.arcFace,y,_,C,l,c,d);const O=this._resolveColor(t.color,n),T=t.core==null?O:this._resolveColor(t.core,n),P=t.gain??1,q=P*(b.ringGain??1.3),V=P*(b.ringCoreGain??3.4);r[f+Rt]=O[0]*q,r[f+Mt]=O[1]*q,r[f+kt]=O[2]*q,r[f+xe]=T[0]*V,r[f+be]=T[1]*V,r[f+Ce]=T[2]*V,r[f+_e]=this._rnd()}_screenAngle(t,e,i){const s=Math.hypot(t,e,i);if(!(s>.2))return 0;const a=this.ctx?.three?.camera?.matrixWorldInverse?.elements;if(!a)return 0;const n=t/s,h=e/s,l=i/s,c=a[0],d=a[4],u=a[8],p=a[1],r=a[5],f=a[9],y=n*c+h*d+l*u,_=n*p+h*r+l*f;return Math.abs(y)<1e-5&&Math.abs(_)<1e-5?0:Math.atan2(_,y)-Math.PI*.5}_arcAngle(t,e,i,s,o,a,n){const h=Math.hypot(o,a,n);if(t!=="trail"||h<.2)return 0;let l,c,d;if(Math.abs(i)<.985){l=-s,c=0,d=e;const x=Math.hypot(l,d)||1;l/=x,d/=x}else l=1,c=0,d=0;const u=i*d-s*c,p=s*l-e*d,r=e*c-i*l,f=o/h,y=a/h,_=n/h,C=f*l+y*c+_*d,v=f*u+y*p+_*r;return Math.atan2(-v,-C)}_alloc(t){if(t.count<t.cap)return t.count++;const e=t.data;let i=0,s=1/0;const o=Math.min(8,t.cap);for(let a=0;a<o;a++){const n=this._rnd()*t.cap|0,h=n*W,l=e[h+rt]-e[h+K];l<s&&(s=l,i=n)}return i}_allocRing(){const t=this.rings;if(t.count<t.cap)return t.count++;const e=t.data;let i=0,s=1/0;for(let o=0;o<t.cap;o++){const a=e[o*L+at]-e[o*L+tt];a<s&&(s=a,i=o)}return i}_onLand(t){const e=Math.abs(t?.impactSpeed??0),i=t?.surface,s=t?.position??this.ctx?.player?.position;if(this._isWet(s,i)){this.spawn("splash",s,{surface:"water",impactSpeed:e,intensity:A(e/16)});return}const o=this.ctx?.player;o?.state==="groundpound"||o?.moveState==="groundpound"||this.spawn("landPuff",s,{surface:i,impactSpeed:e})}_onJump(t){const e=t?.position??this.ctx?.player?.position,i=t?.type;this._sinceJump=0,this._apexFired=!1,this._spinFired=!1;const s=i==="triple"||i==="backflip"||i==="sideFlip";this.spawn("jumpRing",e,{surface:this.ctx?.player?.surface,intensity:s?1:i==="double"?.8:.62}),this._pos.set(e?.x??0,(e?.y??0)+(w.launchUp??.1),e?.z??0),this.spawn("launchBurst",this._pos,{surface:this.ctx?.player?.surface,intensity:s?1:i==="double"?.82:.6})}_onPound(t){const e=t?.position??this.ctx?.player?.position;this.spawn("poundShock",e,{surface:this.ctx?.player?.surface,radius:t?.radius??2.4,intensity:1})}_onWallJump(t){const e=t?.position??this.ctx?.player?.position;this.spawn("dust",e,{surface:this.ctx?.player?.surface,countScale:1.6}),this.spawn("jumpRing",e,{surface:this.ctx?.player?.surface,intensity:.7,normal:t?.normal})}_onFootstep(t){this._lastFootstepFrame=this.ctx?.time?.fixedFrame??0;const e=t?.speed??this.ctx?.player?.speed??0;e<(w.footstepMinSpeed??1.2)||this.spawn("dust",t?.position??this.ctx?.player?.position,{surface:t?.surface,intensity:A(e/8.6)})}_onBirdThrow(t){this.spawn("featherBurst",t?.origin??this.ctx?.player?.position,{countScale:.45,intensity:.55,velocity:t?.direction})}_onBirdBounce(t){const e=t?.position??this.ctx?.player?.position;this.spawn("featherBurst",e,{countScale:1,intensity:1}),this.spawn("jumpRing",e,{intensity:.85})}_onSunstone(t){this.spawn("collect",t?.position??this.ctx?.player?.position,{intensity:1})}_onCoin(t){this.spawn("sparkle",t?.position??this.ctx?.player?.position,{intensity:.55,countScale:.6})}_onDefeat(t){const e=t?.position??this.ctx?.player?.position;this.spawn("landPuff",e,{surface:this.ctx?.player?.surface,intensity:.85}),this.spawn("sparkle",e,{intensity:1,countScale:1.8})}fixedUpdate(t,e){if(!this._ready)return;const i=e.player;if(!i)return;const s=e.time?.fixedFrame??0,o=i.velocity?.x??0,a=i.velocity?.y??0,n=i.velocity?.z??0,h=i.speed??Math.hypot(o,n);i.grounded?(this._airFrames=0,this._apexFired=!0,this._spinFired=!0):this._airFrames<1e5&&this._airFrames++,this._sinceJump<1e5&&this._sinceJump++,this._updateContactShadow(e,i);const l=gt?.seaLevel;if(l!=null&&i.grounded&&h>(w.waterMinSpeed??1.4)){const u=w.waterBand??.55;(Math.abs((i.position?.y??0)-l)<u||i.surface==="water")&&s%(w.waterInterval??4)===0&&this.spawn("waterTrail",i.position,{surface:"water",intensity:A(h/8.6)})}if(this._speedLines(i,s,h),this._wallSlide(i,s),!i.grounded){this._airborne(i,s,o,a,n);return}if(i.state==="skid"){s%(w.skidInterval??3)===0&&this.spawn("skid",i.position,{surface:i.surface,intensity:A(h/8.6)});return}const c=w.runInterval|0;c>0&&h>(w.runMinSpeed??4.6)&&s%c===0&&this.spawn("dust",i.position,{surface:i.surface,countScale:w.runScale??.42,intensity:A(h/8.6)}),s-this._lastFootstepFrame>(w.footstepFallbackFrames??22)&&h>(w.footstepMinSpeed??1.2)&&s%(w.footstepFallbackFrames??22)===0&&this.spawn("dust",i.position,{surface:i.surface,intensity:A(h/8.6)})}_airborne(t,e,i,s,o){const a=t.position;if(!a)return;const n=Math.hypot(i,s,o),h=1/Math.max(.001,n),l=Math.max(1,w.airInterval|0||4);if(this._airFrames>=(w.airMinFrames??3)&&n>(w.airMinSpeed??2.6)&&e%l===0){const r=w.airTrailBack??.34;this._pos.set(a.x-i*h*r,a.y-s*h*r*.4-(w.airTrailDown??.28),a.z-o*h*r),this.spawn("airTrail",this._pos,{intensity:A(.4+n/16)})}const c=t.jumpState,d=c==="tripleJump"||c==="backflip"||c==="sideFlip"||c==="doubleJump";if(!this._spinFired&&d&&this._sinceJump>=(w.spinFrames??4)&&(this._spinFired=!0,this._pos.set(a.x,a.y+(w.spinUp??.02),a.z),this.spawn("spinRibbon",this._pos,{intensity:c==="tripleJump"||c==="backflip"?1:.72})),(t.diving||t.rolling||t.jumpState==="longJump")&&e%Math.max(1,w.diveInterval|0||3)===0&&n>(w.diveMinSpeed??4)){const r=w.diveTrailBack??.42;this._pos.set(a.x-i*h*r,a.y-s*h*r*.5+(w.diveTrailUp??.04),a.z-o*h*r),this.spawn("diveTrail",this._pos,{intensity:A(.45+n/18)})}const p=t.poundPhase==="slam"||t.moveState==="groundpound"&&s<-6;p&&e%Math.max(1,w.slamInterval|0||2)===0&&(this._pos.set(a.x,a.y+(w.slamUp??.3),a.z),this.spawn("slamStreak",this._pos,{intensity:A(Math.abs(s)/18)})),this._wasSlamming=p,!this._apexFired&&this._sinceJump>=(w.apexFrames??11)&&s<(w.apexVy??6.2)&&this._shadowDrop>(w.apexMinHeight??1)&&(this._apexFired=!0,this._pos.set(a.x,a.y+.06,a.z),this.spawn("apexSpark",this._pos,{intensity:1}))}_wallSlide(t,e){if(!t.wallSliding||!t.position||e%Math.max(1,w.wallInterval|0||3)!==0)return;const i=t.wallSlideNormal;if(!i||typeof i.x!="number")return;const s=Math.hypot(i.x,i.z)||1,o=i.x/s,a=i.z/s,n=w.wallOut??.3;this._pos.set(t.position.x+o*n,t.position.y+(w.wallUp??.34),t.position.z+a*n),this._vel.set(o*1.6,2.6,a*1.6),this.spawn("wallSpark",this._pos,{intensity:.9,velocity:this._vel})}_speedLines(t,e,i){const o=t.state==="dive"||t.state==="roll"||t.state==="longjump"?w.streakDiveSpeed??6.5:w.streakMinSpeed??9;if(i<=o)return;const a=Math.max(1,w.streakInterval|0||3);e%a===0&&this.spawn("speedStreak",t.position,{intensity:A(.4+(i-o)/7)})}_updateContactShadow(t,e){const i=this.contact;if(!i)return;const s=b.contactShadow??{},o=e.position;if(!o||e.grounded){i.mesh.visible=!1,this._shadowDrop=e?.grounded?0:-1;return}const a=o.y;let n=-1,h=o.x,l=0,c=o.z;const d=t.world?.collision;if(d?.raycast){this._rayO.set(o.x,a+.02,o.z),this._rayD.set(0,-1,0);const F=d.raycast(this._rayO,this._rayD,s.maxDrop??30);F&&F.point&&(h=F.point.x,l=F.point.y,c=F.point.z,n=a-l)}const u=gt?.seaLevel;if(u!=null&&a>u&&(n<0||l<u)&&(h=o.x,c=o.z,l=u,n=a-u),this._shadowDrop=n,n<0){i.mesh.visible=!1;return}const p=s.fadeInFrom??.3,r=s.fadeInTo??1.7,f=s.fadeOutFrom??15,y=s.fadeOutTo??26,_=A((n-p)/Math.max(.001,r-p)),C=1-A((n-f)/Math.max(.001,y-f)),v=_*_*(3-2*_)*C;if(v<=.003){i.mesh.visible=!1;return}const x=Math.min(s.maxRadius??1.55,(s.radius??.66)+n*(s.grow??.048));i.mesh.position.set(h,l+(s.lift??.05),c),i.mesh.scale.set(x*2,1,x*2),i.material.uniforms.uAlpha.value=(s.alpha??.5)*v,i.material.uniforms.uSoft.value=(s.softNear??.2)+((s.softFar??.74)-(s.softNear??.2))*A(n/8),i.mesh.visible=!0}update(t,e,i){if(!this._ready)return;this._syncUniforms(i);const s=i.time?.elapsed??0;let o=s-this._lastElapsed;if(this._lastElapsed=s,o>0){const a=b.maxSubStep??.03333333333333333;let n=Math.ceil(o/a);const h=b.maxSubSteps??30;n>h&&(n=h),n<1&&(n=1);const l=o/n;for(let c=0;c<n;c++)this._sim(this.soft,l),this._sim(this.glow,l),this._simRings(l)}this._write(this.soft),this._write(this.glow),this._writeRings(),i.fx&&(i.fx.particleCount=this.soft.count+this.glow.count+this.rings.count)}_sim(t,e){const i=t.data;let s=t.count,o=0;for(;o<s;){const a=o*W,n=i[a+K]+e;if(n>=i[a+rt]){s--,o!==s&&i.copyWithin(a,s*W,s*W+W);continue}i[a+K]=n;const h=i[a+de];if(h>0){const d=i[a+bt],u=i[a+fe];i[a+it]+=Math.sin(d+n*h)*u*e,i[a+st]+=Math.cos(d*1.7+n*h*.83)*u*e,i[a+lt]+=Math.sin(d+n*h*.9)*1.6*e}i[a+J]+=i[a+Kt]*e;const l=1/(1+i[a+Zt]*e);i[a+it]*=l,i[a+J]*=l,i[a+st]*=l,i[a+yt]+=i[a+it]*e,i[a+Y]+=i[a+J]*e,i[a+vt]+=i[a+st]*e;const c=i[a+Qt];c>0&&i[a+Ct]<.5&&i[a+Y]<i[a+ht]&&(i[a+Y]=i[a+ht],i[a+J]<0&&(i[a+J]=-i[a+J]*c),i[a+it]*=.62,i[a+st]*=.62,i[a+xt]*=.55),i[a+lt]+=i[a+xt]*e,o++}t.count=s}_simRings(t){const e=this.rings,i=e.data;let s=e.count,o=0;for(;o<s;){const a=o*L,n=i[a+tt]+t;if(n>=i[a+at]){s--,o!==s&&i.copyWithin(a,s*L,s*L+L);continue}if(i[a+tt]=n,i[a+Dt]>0){const h=this.ctx?.player?.position;h&&(i[a+Z]=h.x+i[a+Tt],i[a+Q]=h.y+i[a+Et],i[a+$]=h.z+i[a+Lt])}else{const h=i[a+ye]*t;i[a+Z]+=i[a+ct]*h,i[a+Q]+=i[a+dt]*h,i[a+$]+=i[a+ft]*h}o++}e.count=s}_write(t){const e=t.data,i=t.iPos,s=t.iSize,o=t.iColor,a=t.iData,n=t.iLife,h=t.count,l=this.ctx?.player?.position,c=l?.x??0,d=l?.y??0,u=l?.z??0;for(let p=0;p<h;p++){const r=p*W,f=e[r+K]/e[r+rt],y=e[r+Ct]>.5,_=y?c:0,C=y?d:0,v=y?u:0;i[p*3]=e[r+yt]+_,i[p*3+2]=e[r+vt]+v;const x=1-f,F=1-x*x,U=e[r+_t]+(e[r+$t]-e[r+_t])*F,B=U*e[r+te];s[p*2]=U,s[p*2+1]=B,i[p*3+1]=e[r+me]>0?Math.max(e[r+Y],e[r+ht]+B*.44):e[r+Y]+C,o[p*3]=e[r+se]+e[r+ne]*f,o[p*3+1]=e[r+ae]+e[r+re]*f,o[p*3+2]=e[r+oe]+e[r+he]*f;const I=e[r+ie],z=e[r+ge];let R;f<I?R=f/I:f<z?R=1:R=(1-f)/Math.max(.001,1-z),R=R<0?0:R>1?1:R;let O=e[r+ee]*(R*R*(3-2*R));const T=e[r+pe];if(T>0){const P=e[r+ue];O*=1-P+P*(.5+.5*Math.sin(e[r+bt]+e[r+K]*T))}a[p*4]=O,a[p*4+1]=e[r+lt],a[p*4+2]=e[r+le],a[p*4+3]=e[r+ce],n[p]=f}t.geometry.instanceCount=h,h>0&&(this._flag(t.aPos,h*3),this._flag(t.aSize,h*2),this._flag(t.aColor,h*3),this._flag(t.aData,h*4),this._flag(t.aLife,h)),t.mesh.visible=h>0}_writeRings(){const t=this.rings,e=t.data,i=t.iCenter,s=t.iAxis,o=t.iRing,a=t.iColor,n=t.iCore,h=t.iArc,l=t.count;for(let c=0;c<l;c++){const d=c*L,u=e[d+tt]/e[d+at],p=1-u,r=1-p*p*p;i[c*3]=e[d+Z],i[c*3+1]=e[d+Q],i[c*3+2]=e[d+$],s[c*4]=e[d+ct],s[c*4+1]=e[d+dt],s[c*4+2]=e[d+ft],s[c*4+3]=e[d+ve];const f=e[d+pt]+(e[d+Ft]-e[d+pt])*r,y=e[d+ut]+(e[d+St]-e[d+ut])*u,_=e[d+Fe];let C=e[d+At]*(u<.06?u/.06:1);u>_&&(C*=Math.pow(1-(u-_)/Math.max(.001,1-_),e[d+we])),o[c*4]=f,o[c*4+1]=y,o[c*4+2]=C,o[c*4+3]=e[d+_e],a[c*3]=e[d+Rt],a[c*3+1]=e[d+Mt],a[c*3+2]=e[d+kt],n[c*3]=e[d+xe],n[c*3+1]=e[d+be],n[c*3+2]=e[d+Ce],h[c*4]=e[d+It],h[c*4+1]=e[d+zt],h[c*4+2]=e[d+Ot],h[c*4+3]=e[d+Se]}t.geometry.instanceCount=l,l>0&&(this._flag(t.aCenter,l*3),this._flag(t.aAxis,l*4),this._flag(t.aRing,l*4),this._flag(t.aColor,l*3),this._flag(t.aCore,l*3),this._flag(t.aArc,l*4)),t.mesh.visible=l>0}_flag(t,e){t.clearUpdateRanges?(t.clearUpdateRanges(),t.addUpdateRange(0,e)):t.updateRange&&(t.updateRange.offset=0,t.updateRange.count=e),t.needsUpdate=!0}_syncUniforms(t){const e=t.render?.lighting,i=e?.sunDirection;i&&Number.isFinite(i.x)&&this._uSunDir.copy(i).normalize();const s=e?.sunTint;if(s&&s.isColor){const a=this._sunGain;this._uSunColor.set(s.r*a,s.g*a,s.b*a)}const o=t.three?.scene?.fog;if(o){this._uFogColor.copy(o.color);const a=this.soft.material.uniforms.uFogDensity;a.value=o.isFogExp2?o.density:1/Math.max(1,(o.far??620)*.62)}}_linear(t){return this._tmpCol.setHex(t,Ee),[this._tmpCol.r,this._tmpCol.g,this._tmpCol.b]}_ladder(t){const e=this._linear(t),i=b.tintFade??[1.1,1.22,1.58],s=b.tintLift??[1.3,1.3,1.34],o=b.tintChip??[.66,.63,.58],a=b.tintDark??[.27,.26,.29],n=b.tintScuff??[.16,.15,.18];return{base:e,fade:[e[0]*i[0],e[1]*i[1],e[2]*i[2]],lift:[e[0]*s[0],e[1]*s[1],e[2]*s[2]],chip:[e[0]*o[0],e[1]*o[1],e[2]*o[2]],dark:[e[0]*a[0],e[1]*a[1],e[2]*a[2]],scuff:[e[0]*n[0],e[1]*n[1],e[2]*n[2]]}}_buildColorTables(){const t=b.surfaceTint??{};for(const e of Object.keys(t))this._tints[e]=this._ladder(t[e]);this._tints.default||(this._tints.default=this._ladder(et.stoneMid));for(const e of Object.keys(wt)){const i=wt[e];for(const s of i.groups??[])this._cacheColor(s.color),this._cacheColor(s.color2);for(const s of i.rings??[])this._cacheColor(s.color),this._cacheColor(s.core)}}_cacheColor(t){typeof t=="number"&&(this._colorCache.has(t)||this._colorCache.set(t,this._linear(t)))}_tintFor(t){return this._tints[t]??this._tints.default}_resolveColor(t,e,i){let s;if(t==="surface"?s=e.base:t==="surfaceFade"?s=e.fade:t==="surfaceLift"?s=e.lift:t==="surfaceDark"?s=e.dark:t==="surfaceChip"?s=e.chip:t==="surfaceScuff"?s=e.scuff:typeof t=="number"?(s=this._colorCache.get(t),s||(s=this._linear(t),this._colorCache.set(t,s))):s=e.base,!i||i===1)return s;const o=this._gained;return o[0]=s[0]*i,o[1]=s[1]*i,o[2]=s[2]*i,o}_isDuplicate(t,e,i,s){const o=this.ctx?.time?.fixedFrame??0,a=this._recent;for(let l=0;l<8;l++){const c=l*5;if(a[c]!==o||this._recentName[l]!==t)continue;const d=a[c+1]-e,u=a[c+2]-i,p=a[c+3]-s;if(d*d+u*u+p*p<.16)return!0}const n=this._recentAt,h=n*5;return a[h]=o,a[h+1]=e,a[h+2]=i,a[h+3]=s,this._recentName[n]=t,this._recentAt=n+1&7,!1}_seedBurst(t){const e=this.ctx?.time?.fixedFrame??0;e!==this._seedFrame&&(this._seedFrame=e,this._seedOrder=0),this._seedOrder++;let i=this._baseSeed;i=Math.imul(i^e,2654435761)>>>0,i=Math.imul(i^this._seedOrder,2246822507)>>>0;for(let s=0;s<t.length;s++)i=Math.imul(i^t.charCodeAt(s),3266489909)>>>0;this._rndState=i||1}_rnd(){this._rndState=this._rndState+1831565813>>>0;let t=this._rndState;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}_r2(t){if(!t)return 0;const e=t[0],i=t[1]??t[0];return e+(i-e)*this._rnd()}_isWet(t,e){if(e==="water")return!0;const i=gt?.seaLevel;if(i==null||!t)return!1;const s=typeof t.y=="number"?t.y:t[1];return Number.isFinite(s)&&s<i+.22}dispose(){for(const t of this._offs)t?.();this._offs.length=0,this.soft?.dispose(),this.glow?.dispose(),this.rings?.dispose(),this.contact?.dispose(),this.soft=this.glow=this.rings=this.contact=null,this._ready=!1}}export{Je as Particles,Je as default};
