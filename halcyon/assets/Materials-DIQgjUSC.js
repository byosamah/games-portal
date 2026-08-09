import{P as e,f as a,D as r}from"./main-BIoil1Wg.js";const c={value:0};function o(s,n,l={}){return new a({color:s,roughness:n,metalness:0,vertexColors:!0,dithering:!0,...l})}function t(s,n=1,l="w"){return s.onBeforeCompile=i=>{i.uniforms.uWind=c,i.uniforms.uAmp={value:n},i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
        attribute float aSway;
        uniform float uWind;
        uniform float uAmp;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        {
          #ifdef USE_INSTANCING
            vec3 swayAnchor = instanceMatrix[3].xyz;
          #else
            vec3 swayAnchor = transformed;
          #endif
          float ph = swayAnchor.x * 0.42 + swayAnchor.z * 0.31;
          float s = aSway * uAmp;
          float gust = 0.72 + 0.28 * sin(uWind * 0.37 + ph * 0.15);
          transformed.x += sin(uWind * 1.9 + ph) * s * gust;
          transformed.z += cos(uWind * 1.55 + ph * 1.13) * s * 0.75 * gust;
          transformed.y += sin(uWind * 2.7 + ph * 0.8) * s * 0.22;
        }`)},s.customProgramCacheKey=()=>`halcyon-wind-${l}-${n}`,s}function u(){const s={limestone:o(e.stoneMid,.94),limestoneWarm:o(e.stoneShadow,.88),stoneBase:o(e.stoneShadow,.95),rock:o(e.stoneShadow,1),rockDeep:o(e.stoneDeepShadow,1),marble:o(e.stoneMid,.26,{metalness:.06}),plaster:o(e.stoneMid,1),pathStone:o(e.stoneLit,.72),roofTile:o(e.clayRoof,.68),roofTileB:o(e.terracotta,.66),terracotta:o(e.terracotta,.8),clay:o(e.terracottaLight,.84),sand:o(e.dryGrass,1),sandWet:o(e.dryGold,.72),timber:o(e.stoneShadow,.78),timberRed:o(e.clayRoof,.6),bronze:new a({color:e.coinBronze,roughness:.32,metalness:.85,vertexColors:!0}),gold:new a({color:e.moonGold,roughness:.24,metalness:.9,vertexColors:!0,emissive:e.moonGlow,emissiveIntensity:.18}),lampGlass:new a({color:e.moonGlow,roughness:.08,metalness:0,vertexColors:!0,transparent:!0,opacity:.42,emissive:e.moonGlow,emissiveIntensity:.55,side:r,depthWrite:!1}),olive:o(e.olive,.92,{side:r}),oliveLight:o(e.oliveLight,.9,{side:r}),cypress:o(e.cypress,.95),scrub:o(e.dryGold,.96,{side:r}),canvasWarm:o(e.dryGold,.98,{side:r}),canvasRed:o(e.terracottaLight,.98,{side:r}),canvasSea:o(e.seaShallow,.98,{side:r}),seabed:o(e.dryGrass,1),seaSurface:new a({color:e.seaMid,roughness:.14,metalness:.05,vertexColors:!0,transparent:!0,opacity:.8,side:r}),foam:o(e.seaFoam,.85,{transparent:!0,opacity:.9}),pond:new a({color:e.seaShallow,roughness:.08,metalness:.1,vertexColors:!0,transparent:!0,opacity:.86}),shadowVoid:new a({color:e.seaDeep,roughness:1,metalness:0,vertexColors:!0}),interior:o(e.stoneDeepShadow,1),farHaze:o(e.skyHorizon,1)};return t(s.canvasWarm,1,"cloth"),t(s.canvasRed,1,"cloth"),t(s.canvasSea,1,"cloth"),t(s.olive,1,"leaf"),t(s.oliveLight,1,"leaf"),t(s.cypress,1,"leaf"),t(s.scrub,1,"leaf"),t(s.seaSurface,1,"sea"),s}export{c as WIND,u as createMaterials,u as default,t as windify};
