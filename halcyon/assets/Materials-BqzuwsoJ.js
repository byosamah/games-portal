import{aB as u,V as m,aE as r,f as h,D as l,e as s}from"./main-BIoil1Wg.js";function i(e,t,a=0,n={}){return new h({color:e,roughness:t,metalness:a,vertexColors:!0,...n})}function c(e,t,a=r.strength){if(!r.enabled)return e;const n={uRimStrength:{value:a},uRimPower:{value:r.power},uRimSky:{value:new s(r.skyColor)},uRimSun:{value:new s(r.sunColor)},uRimUp:{value:r.upBias},uRimSunDir:{value:t}};return e.userData.rim=n,e.onBeforeCompile=o=>{Object.assign(o.uniforms,n),o.fragmentShader=o.fragmentShader.replace("void main() {",`
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
          // Grazing angle, tightened so the term draws an EDGE rather than
          // washing the whole form. At power 2.9 it is confined to roughly the
          // last twenty degrees before the silhouette.
          float rimF = pow( 1.0 - clamp( dot( rimN, rimV ), 0.0, 1.0 ), uRimPower );
          // Rims are strongest along the top of a form, because the sky is up
          // there. Without the bias it is a uniform halo, which reads as a
          // shader rather than as light.
          float up = clamp( rimN.y * 0.5 + 0.5, 0.0, 1.0 );
          rimF *= mix( 1.0 - uRimUp, 1.0, up );
          // Cool on the shaded contour, hot where the edge faces the sun. One
          // body carries both round its outline, which is what a real one does.
          float lit = clamp( dot( rimN, uRimSunDir ) * 0.5 + 0.5, 0.0, 1.0 );
          outgoingLight += rimF * uRimStrength * mix( uRimSky, uRimSun, lit * lit );
        }
        #include <opaque_fragment>
      `)},e.customProgramCacheKey=()=>"halcyon-rig-rim",e}function p(){const e=u,t={skin:i(e.skin,.62,0),hair:i(e.hair,.66,0),cap:i(e.cap,.7,0),capBand:i(e.capBand,.38,.45),shirt:i(e.shirt,.8,0),jacket:i(e.jacket,.76,0),trousers:i(e.trousers,.84,0),belt:i(e.belt,.56,0),boot:i(e.boot,.62,0),scarf:i(e.scarf,.86,0,{side:l}),satchel:i(e.satchel,.74,0),strap:i(e.satchelFlap,.6,0),brass:i(e.brass,.34,.72),eyeWhite:i(e.eyeWhite,.24,0),iris:i(e.iris,.18,0),ink:i(e.ink,.66,0)},a=new m(.42,.72,.55).normalize(),n=new Set(r.skip??[]);for(const o of Object.keys(t))t[o].name=`rig.${o}`,n.has(o)||c(t[o],a,o==="scarf"?r.scarfStrength??r.strength:r.strength);return t.sunDirView=a,t}function d(e){for(const t of Object.keys(e))e[t]?.dispose?.()}export{p as buildMaterials,p as default,d as disposeMaterials};
