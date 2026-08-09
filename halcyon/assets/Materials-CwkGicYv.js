import{P as t,b8 as n,f,z as v,e as m,V as c,q as h}from"./main-BM5PwmOq.js";import{applyShade as s}from"./Shade-CYFpy7Qc.js";import"./Geom-BoSyXAtS.js";import"./BufferGeometryUtils-C4YVS9jO.js";const d={value:0},p={value:1};function r(a,o,e={},l=n.shade.stone){const i=new f({color:a,roughness:o,metalness:0,vertexColors:!0,dithering:!0,...e});return i.userData.baseHex=a,i.userData.halFill=n.shade.fill*l,i}function u(a,o=.06,e=1,l="w"){return a.onBeforeCompile=i=>{i.uniforms.uWind=d,i.uniforms.uGust=p,i.uniforms.uAmp={value:o},i.uniforms.uFreq={value:e},i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
        attribute float aSway;
        attribute float aPhase;
        uniform float uWind;
        uniform float uGust;
        uniform float uAmp;
        uniform float uFreq;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        {
          float ph = aPhase;
          float w = uWind * uFreq;
          float gust = ${(1-n.wind.gustDepth).toFixed(3)}
            + ${n.wind.gustDepth.toFixed(3)} * (0.5 + 0.5 * sin(uWind * ${(n.wind.gustHz*6.2832).toFixed(4)} + ph * 0.37));
          float s = aSway * uAmp * gust * uGust;
          float a = sin(w + ph);
          transformed.x += a * s;
          transformed.z += cos(w * 0.81 + ph * 1.37) * s * 0.74;
          // A leaf on a stem swings on an ARC, so the tip drops as it travels.
          // Translating it sideways alone is what makes cheap foliage look like
          // it is sliding rather than bending.
          transformed.y -= abs(a) * s * 0.22;
        }`)},a.customProgramCacheKey=()=>`halcyon-envart-wind-${l}-${o}-${e}`,a}function g(a,o=.22,e=7,l="flap"){return a.onBeforeCompile=i=>{i.uniforms.uWind=d,i.uniforms.uAmp={value:o},i.uniforms.uRate={value:e},i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
        attribute float aSway;
        attribute float aPhase;
        uniform float uWind;
        uniform float uAmp;
        uniform float uRate;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        {
          float f = sin(uWind * uRate + aPhase * 6.283);
          transformed.y += f * aSway * uAmp;
          transformed.x *= 1.0 - abs(f) * aSway * 0.16;
        }`)},a.customProgramCacheKey=()=>`halcyon-envart-flap-${o}-${e}`,a}function b(){const a=n.wind,o=n.shade,e={rockMid:r(t.rockMid,.92,{},o.rock),rockWet:r(t.rockWet,.42,{metalness:.04},o.rock),paving:r(t.stoneLit,.74),pavingWorn:r(t.pavingWorn,.58),mosaic:r(t.stoneMid,.34,{metalness:.05}),puddle:new f({color:t.seaDeep,roughness:.05,metalness:.22,vertexColors:!0,transparent:!0,opacity:.72}),timber:r(t.timberWarm,.6),rope:r(t.dryGrass,1),iron:r(t.ironDark,.44,{metalness:.62}),pot:r(t.terracottaLight,.82),cloth:r(t.clothLinen,.98,{},o.cloth),veg:r(t.olive,.93,{},o.veg),grassDry:r(t.dryGold,.98,{},o.veg),grassJoint:r(t.oliveSilver,.95,{},o.veg),bird:r(t.uiPaper,.88)};u(e.veg,a.leaf*1.15,1.06,"leaf"),u(e.grassDry,a.grass,1.45,"grass"),u(e.grassJoint,a.grass*.85,1.3,"weed"),u(e.cloth,a.cloth,.9,"cloth"),g(e.bird,.2,6.4,"gull"),s(e.rockMid,{strata:!0,fillAmount:e.rockMid.userData.halFill}),s(e.rockWet,{strata:!0,strataGain:.7,fillAmount:e.rockWet.userData.halFill}),s(e.paving,{pave:!0,fillAmount:e.paving.userData.halFill}),s(e.pavingWorn,{pave:!0,paveLevel:n.ground.slab.fragLevel*1.03,fillAmount:e.pavingWorn.userData.halFill});for(const l of["mosaic","timber","rope","iron","pot","cloth","veg","grassDry","grassJoint","bird"])s(e[l],{fillAmount:e[l].userData.halFill});return e.oliveDark=e.veg,e.oliveSilver=e.veg,e.cypressDark=e.veg,e.vine=e.veg,e.flower=e.veg,e.lichen=e.veg,e.clothLinen=e.cloth,e.clothOchre=e.cloth,e.clothRose=e.cloth,e.clothIndigo=e.cloth,e.driftwood=e.timber,e.net=e.rope,e.brass=e.iron,e.potDark=e.pot,e.sand=e.pavingWorn,e.sandPale=e.pavingWorn,e.groundInk=e.pavingWorn,e.plasterWhite=e.paving,e.rockLit=e.rockMid,e.rockShade=e.rockMid,e.birdFar=e.bird,e}const k={oliveSilver:[t.oliveSilver,t.olive],cypressDark:[t.cypress,t.olive],vine:[t.vineGreen,t.olive],flower:[t.geraniumRed,t.olive],lichen:[t.rockLichen,t.olive],clothOchre:[t.clothOchre,t.clothLinen],clothRose:[t.clothRose,t.clothLinen],clothIndigo:[t.clothIndigo,t.clothLinen],driftwood:[t.timberGrey,t.timberWarm],brass:[t.coinBronze,t.ironDark],sand:[t.dryGrass,t.pavingWorn],potDark:[t.roofRed,t.terracottaLight]};function W(a,o,e){return new v({transparent:!0,depthWrite:!1,blending:h,uniforms:{uWind:d,uBox:{value:new c(...a)},uOrigin:{value:new c(...o)},uSize:{value:e},uTint:{value:new m(t.moonGlow)}},vertexShader:`
      attribute vec3 aSeed;
      uniform float uWind;
      uniform vec3 uBox;
      uniform vec3 uOrigin;
      uniform float uSize;
      varying float vFade;
      void main() {
        vec3 p = position;
        float t = uWind;
        p.x += sin(t * 0.17 + aSeed.x * 6.283) * 1.7 + t * (0.16 + aSeed.z * 0.20);
        p.y += sin(t * 0.41 + aSeed.y * 6.283) * 0.55 + t * 0.045;
        p.z += cos(t * 0.13 + aSeed.z * 6.283) * 1.5 + t * (0.07 + aSeed.x * 0.09);
        p = mod(p + uBox * 0.5, uBox) - uBox * 0.5 + uOrigin;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float d = max(0.4, -mv.z);
        // A mote you can see from forty metres is snow. They only exist in the
        // near field, and they fade out again right in front of the lens so
        // nothing ever sits on the glass.
        vFade = smoothstep(1.2, 4.5, d) * (1.0 - smoothstep(15.0, 34.0, d))
              * (0.45 + 0.55 * sin(t * 0.9 + aSeed.x * 12.0) * 0.5 + 0.275);
        // SIZE IS CLAMPED, and the clamp is worth eight milliseconds a frame.
        //
        // Unclamped, 620/d gives a mote 1.2 m from the lens a diameter of
        // sixty CSS pixels - a hundred and twenty device pixels at the capture's
        // pixel ratio - and four hundred additively blended discs that size is
        // several million blended fragments per frame. Measured: the same build
        // ran at 80.9 fps without this layer and 40.1 fps with it, on twelve
        // extra draw calls. Dust is a SPECK. Eight pixels, and a point that has
        // faded out is given zero size so the rasteriser drops it entirely.
        float sz = min(uSize * (0.45 + aSeed.y * 1.75) * 620.0 / d, 8.0);
        gl_PointSize = vFade > 0.012 ? sz : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      uniform vec3 uTint;
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = dot(c, c);
        if (r > 0.25) discard;
        float a = (1.0 - r * 4.0);
        gl_FragColor = vec4(uTint, a * a * vFade * 0.85);
      }`})}export{k as HUE,d as WIND,b as createProps,b as default,g as flapify,W as moteMaterial,u as windify};
