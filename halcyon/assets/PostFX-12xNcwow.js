import{l as H,aP as j,i as Q,ak as A,z as d,aQ as E,a as h,aR as v,aS as g,aT as W,aU as q,e as x,V as m,q as K,k as X,ap as i,aV as Y,aW as $,aX as L,aY as b,a1 as P,aZ as Z,M as B,as as R}from"./main-BM5PwmOq.js";const D={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class S{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const J=new j(-1,1,1,-1,0,1);class ee extends Q{constructor(){super(),this.setAttribute("position",new A([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new A([0,2,0,0,2,0],2))}}const te=new ee;class y{constructor(e){this._mesh=new H(te,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,J)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class V extends S{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof d?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=E.clone(e.uniforms),this.material=new d({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new y(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class F extends S{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const o=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,l;this.inverse?(r=0,l=1):(r=1,l=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(o.REPLACE,o.REPLACE,o.REPLACE),a.buffers.stencil.setFunc(o.ALWAYS,r,4294967295),a.buffers.stencil.setClear(l),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(o.EQUAL,1,4294967295),a.buffers.stencil.setOp(o.KEEP,o.KEEP,o.KEEP),a.buffers.stencil.setLocked(!0)}}class ae extends S{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class se{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new h);this._width=s.width,this._height=s.height,t=new v(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:g}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new V(D),this.copyPass.material.blending=W,this.clock=new q}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let o=0,a=this.passes.length;o<a;o++){const r=this.passes[o];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(o),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){const l=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}F!==void 0&&(r instanceof F?s=!0:r instanceof ae&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new h);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,o=this._height*this._pixelRatio;this.renderTarget1.setSize(s,o),this.renderTarget2.setSize(s,o);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,o)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}const ie={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new x(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class _ extends S{constructor(e,t=1,s,o){super(),this.strength=t,this.radius=s,this.threshold=o,this.resolution=e!==void 0?new h(e.x,e.y):new h(256,256),this.clearColor=new x(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new v(a,r,{type:g}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const c=new v(a,r,{type:g});c.texture.name="UnrealBloomPass.h"+f,c.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(c);const w=new v(a,r,{type:g});w.texture.name="UnrealBloomPass.v"+f,w.texture.generateMipmaps=!1,this.renderTargetsVertical.push(w),a=Math.round(a/2),r=Math.round(r/2)}const l=ie;this.highPassUniforms=E.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=o,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new d({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];const n=[6,10,14,18,22];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(n[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new h(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new m(1,1,1),new m(1,1,1),new m(1,1,1),new m(1,1,1),new m(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=E.clone(D.uniforms),this.blendMaterial=new d({uniforms:this.copyUniforms,vertexShader:D.vertexShader,fragmentShader:D.fragmentShader,blending:K,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new x,this._oldClearAlpha=1,this._basic=new X,this._fsQuad=new y(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let s=Math.round(e/2),o=Math.round(t/2);this.renderTargetBright.setSize(s,o);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,o),this.renderTargetsVertical[a].setSize(s,o),this.separableBlurMaterials[a].uniforms.invSize.value=new h(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2)}render(e,t,s,o,a){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const r=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=s.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let l=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=l.texture,this.separableBlurMaterials[n].uniforms.direction.value=_.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[n]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=_.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[n]),e.clear(),this._fsQuad.render(e),l=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(s),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){const t=[],s=e/3;for(let o=0;o<e;o++)t.push(.39894*Math.exp(-.5*o*o/(s*s))/s);return new d({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new h(.5,.5)},direction:{value:new h(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;
					}
					gl_FragColor = vec4( diffuseSum, 1.0 );
				}`})}_getCompositeMaterial(e){return new d({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}_.BlurDirectionX=new h(1,0);_.BlurDirectionY=new h(0,1);const oe={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new h(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`};class re extends V{constructor(){super(oe)}setSize(e,t){this.material.uniforms.resolution.value.set(1/e,1/t)}}const T=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`,N=`
uniform sampler2D tDepth;
uniform mat4 uProjInv;

vec3 viewPosition( vec2 uv, float d ) {
  vec4 clip = vec4( uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0 );
  vec4 v = uProjInv * clip;
  return v.xyz / v.w;
}
vec3 viewPositionAt( vec2 uv ) {
  return viewPosition( uv, texture2D( tDepth, uv ).x );
}
`,ne=`
precision highp float;
varying vec2 vUv;
${N}
uniform mat4 uProj;
uniform vec2 uResolution;
uniform vec3 uKernel[ SAMPLES ];
uniform float uRadius;
uniform float uRadiusRef;
uniform float uRadiusGrow;
uniform float uBias;
uniform float uBiasSlope;
uniform float uBiasMaxFraction;
uniform float uPower;
uniform float uFadeStart;
uniform float uFadeEnd;

uniform vec3 uSunView;
uniform float uPixelScale;
uniform float uContactLength;
uniform float uContactThickness;
uniform float uContactMinDepth;
uniform float uContactPower;
uniform float uContactMinPixels;
uniform float uContactMaxStretch;
uniform float uContactFadeStart;
uniform float uContactFadeEnd;

float hash12( vec2 p ) {
  vec3 p3 = fract( vec3( p.xyx ) * 0.1031 );
  p3 += dot( p3, p3.yzx + 33.33 );
  return fract( ( p3.x + p3.y ) * p3.z );
}

#ifdef USE_CONTACT
/**
 * Screen space contact shadow.
 *
 * Walk a short ray from the shading point towards the sun through the depth
 * buffer. If anything is in the way inside half a metre, the sun is blocked
 * there and nothing in the shadow map is ever going to know about it: at any
 * affordable resolution its texels are centimetres wide and its depth bias is
 * centimetres deep, and the first few centimetres around a contact point are
 * exactly the region those two numbers erase. That erased region is the only
 * part of a shadow the eye actually uses to decide what is resting on what.
 *
 * The strength falls off with how far along the ray the blocker was found, so
 * the result is a tight dark pool where the sole meets the slab that has faded
 * to nothing half a body width away. That gradient is the whole point; a flat
 * dark disc reads as a decal, not as contact.
 */
float contactShadow( vec3 P, vec3 N ) {
  float ndl = dot( N, uSunView );
  if ( ndl <= 0.02 ) return 0.0;   // already facing away; the surface self shades

  float depth = max( -P.z, 0.05 );

  // Half a metre is 40 px across at six metres and two px across at sixty, and
  // two pixels cannot describe anything. Past that the march is stretched so its
  // SCREEN length stays constant, which is what keeps a distant crate sitting on
  // the ground in a wide shot instead of hovering over it.
  float pxPerMetre = uPixelScale / depth;
  float wanted = uContactMinPixels / max( pxPerMetre, 1e-4 );
  float len = clamp( max( uContactLength, wanted ),
                     uContactLength, uContactLength * uContactMaxStretch );
  float scale = len / uContactLength;

  float jitter = hash12( gl_FragCoord.xy );
  vec3 stepV = uSunView * ( len / float( CONTACT_STEPS ) );
  vec3 ray = P + N * ( uContactMinDepth * 2.0 * scale ) + stepV * ( 0.35 + 0.65 * jitter );

  float thickness = uContactThickness * scale;
  float minDepth = uContactMinDepth * scale;
  float occ = 0.0;

  for ( int i = 0; i < CONTACT_STEPS; i ++ ) {
    vec4 c = uProj * vec4( ray, 1.0 );
    if ( c.w <= 0.0 ) break;
    vec2 suv = ( c.xy / c.w ) * 0.5 + 0.5;
    if ( suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0 ) break;

    float sd = texture2D( tDepth, suv ).x;
    if ( sd < 0.99999 ) {
      float sz = viewPosition( suv, sd ).z;
      float diff = sz - ray.z;   // > 0 means the scene surface is in front of us
      if ( diff > minDepth && diff < thickness ) {
        occ = 1.0 - ( float( i ) + 0.5 ) / float( CONTACT_STEPS );
        break;
      }
    }
    ray += stepV;
  }

  occ = pow( clamp( occ, 0.0, 1.0 ), uContactPower );
  occ *= smoothstep( 0.02, 0.30, ndl );
  occ *= 1.0 - smoothstep( uContactFadeStart, uContactFadeEnd, depth );
  return occ;
}
#endif

void main() {
  float d = texture2D( tDepth, vUv ).x;

  // Sky. Nothing to occlude, and reconstructing a position out here produces a
  // point at the far plane which would smear occlusion across the horizon.
  if ( d >= 0.99999 ) { gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ); return; }

  vec3 P = viewPosition( vUv, d );
  vec2 texel = 1.0 / uResolution;
  float depth = -P.z;

  // Normals from depth, picking whichever neighbour is closer in z on each
  // axis. The naive two-tap version bleeds across silhouettes and paints a
  // dark halo round every object, which reads as dirt rather than as contact.
  vec3 pr = viewPositionAt( vUv + vec2( texel.x, 0.0 ) );
  vec3 pl = viewPositionAt( vUv - vec2( texel.x, 0.0 ) );
  vec3 pu = viewPositionAt( vUv + vec2( 0.0, texel.y ) );
  vec3 pd = viewPositionAt( vUv - vec2( 0.0, texel.y ) );
  vec3 ddx = ( abs( pr.z - P.z ) < abs( P.z - pl.z ) ) ? ( pr - P ) : ( P - pl );
  vec3 ddy = ( abs( pu.z - P.z ) < abs( P.z - pd.z ) ) ? ( pu - P ) : ( P - pd );
  vec3 N = normalize( cross( ddx, ddy ) );

  // Per pixel rotation of the kernel, from the pixel's own coordinate. Static,
  // so the pattern is identical every frame: determinism is a hard requirement
  // here, and a time varying rotation would also shimmer while standing still.
  float a = hash12( gl_FragCoord.xy ) * 6.2831853;
  vec3 rv = vec3( cos( a ), sin( a ), 0.0 );
  vec3 T = normalize( rv - N * dot( rv, N ) );
  vec3 B = cross( N, T );
  mat3 TBN = mat3( T, B, N );

  // Radius grows past the reference depth so the kernel keeps a constant
  // footprint ON SCREEN. A fixed world radius silently stops resolving contact
  // the moment an object is far enough away that the whole sphere is four
  // pixels wide, which is most of a wide shot.
  float radius = uRadius * clamp( depth / uRadiusRef, 1.0, uRadiusGrow );

  // The depth buffer loses precision with distance, so the bias has to grow
  // with it - but ONLY up to a fixed fraction of the sample radius. The previous
  // version grew it by 5.5 cm per metre of depth against a 0.70 m radius, which
  // means the bias overtook the radius at 12.7 m and the pass returned exactly
  // zero occlusion for everything beyond, in silence. That failure mode is now
  // arithmetically unreachable: the clamp is the whole fix.
  float bias = min( uBias * ( 1.0 + depth * uBiasSlope ), radius * uBiasMaxFraction );

  float occ = 0.0;
  float valid = 0.0;
  for ( int i = 0; i < SAMPLES; i ++ ) {
    vec3 sp = P + TBN * uKernel[ i ] * radius;
    vec4 off = uProj * vec4( sp, 1.0 );
    if ( off.w <= 0.0 ) continue;
    vec2 suv = ( off.xy / off.w ) * 0.5 + 0.5;
    if ( suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0 ) continue;

    float sd = texture2D( tDepth, suv ).x;
    if ( sd >= 0.99999 ) continue;
    valid += 1.0;
    float sz = viewPosition( suv, sd ).z;

    // Range check: a surface far behind the sample point is a different object,
    // not an occluder. Without this every foreground edge casts occlusion onto
    // the background.
    float range = smoothstep( 0.0, 1.0, radius / max( 1e-4, abs( P.z - sz ) ) );
    occ += step( sp.z + bias, sz ) * range;
  }

  float ao = pow( clamp( 1.0 - occ / float( SAMPLES ), 0.0, 1.0 ), uPower );
  float fade = 1.0 - smoothstep( uFadeStart, uFadeEnd, depth );
  ao = mix( 1.0, ao, fade );

  float contact = 0.0;
  #ifdef USE_CONTACT
    contact = contactShadow( P, N );
  #endif

  // .b and .a are diagnostics, passed through the blur unfiltered. They cost
  // nothing and they are the only way to tell "the occlusion is correctly zero
  // here" apart from "no sample ever landed on screen", which are the same white
  // image and otherwise cost a round of guessing to separate.
  //   .b = fraction of samples that projected inside the frame and hit geometry
  //   .a = raw occlusion fraction, before power and distance fade
  gl_FragColor = vec4( ao, contact, valid / float( SAMPLES ), occ / float( SAMPLES ) );
}
`,le=`
precision highp float;
varying vec2 vUv;
${N}
uniform sampler2D tAO;
uniform vec2 uTexel;
uniform float uDepthSigma;

void main() {
  float dc = texture2D( tDepth, vUv ).x;
  if ( dc >= 0.99999 ) { gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 ); return; }
  float zc = viewPosition( vUv, dc ).z;

  vec2 sum = vec2( 0.0 );
  float wsum = 0.0;
  for ( int y = -1; y <= 1; y ++ ) {
    for ( int x = -1; x <= 1; x ++ ) {
      vec2 uv = vUv + vec2( float( x ), float( y ) ) * uTexel;
      float ds = texture2D( tDepth, uv ).x;
      float z = viewPosition( uv, ds ).z;
      // Depth aware, so the blur never drags occlusion across a silhouette.
      float w = exp( -abs( z - zc ) * uDepthSigma );
      sum += texture2D( tAO, uv ).rg * w;
      wsum += w;
    }
  }
  vec2 diag = texture2D( tAO, vUv ).ba;
  gl_FragColor = vec4( sum / max( wsum, 1e-4 ), diag.x, diag.y );
}
`,ue=`
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene;
uniform sampler2D tAO;
uniform float uExposure;
uniform float uAOIntensity;
uniform vec3 uAOColor;
uniform float uContactIntensity;
uniform vec3 uContactColor;
uniform float uDebug;

void main() {
  vec3 c = texture2D( tScene, vUv ).rgb * uExposure;

  #ifdef USE_AO
    vec2 g = texture2D( tAO, vUv ).rg;
    float ao = g.r;
    float contact = g.g;

    // Diagnostics. Grounding is invisible when it is right and invisible when it
    // is broken, and those two states have to be tellable apart from a
    // screenshot. 1 = split screen, 2 = contact term alone, 3 = the product.
    if ( uDebug > 0.5 ) {
      if ( uDebug < 1.5 && vUv.x < 0.5 ) { gl_FragColor = vec4( vec3( ao ) * 0.6, 1.0 ); return; }
      if ( uDebug > 1.5 && uDebug < 2.5 ) { gl_FragColor = vec4( vec3( 1.0 - contact ), 1.0 ); return; }
      if ( uDebug > 2.5 && uDebug < 3.5 ) { gl_FragColor = vec4( vec3( ao * ( 1.0 - contact ) ), 1.0 ); return; }
      if ( uDebug > 3.5 && uDebug < 4.5 ) { gl_FragColor = vec4( vec3( texture2D( tAO, vUv ).b ), 1.0 ); return; }
      if ( uDebug > 4.5 ) { gl_FragColor = vec4( vec3( texture2D( tAO, vUv ).a ), 1.0 ); return; }
    }

    float k = 1.0 - ( 1.0 - ao ) * uAOIntensity;
    // Occlusion tints as well as darkens. Under a hard sun the only light
    // reaching a crevice is sky light, so contact shadows are cool and blue.
    // Multiplying straight to grey is what makes SSAO look like soot.
    c *= mix( uAOColor, vec3( 1.0 ), k );

    // The contact term is a *sun blocker*, so it darkens further and toward the
    // same hue the shadow planes carry. Applied after the occlusion so a corner
    // that is both occluded and shadowed reads as the darkest thing in frame,
    // which is what a real contact point is.
    float kc = 1.0 - contact * uContactIntensity;
    c *= mix( uContactColor, vec3( 1.0 ), kc );
  #endif

  gl_FragColor = vec4( c, 1.0 );
}
`,he=`
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uCA;
uniform float uVignette;
uniform float uVignetteSoftness;
uniform float uSaturation;
uniform float uContrast;
uniform float uLift;
uniform vec3 uLiftColor;
uniform float uLiftRange;
uniform float uGamma;
uniform float uGain;
uniform vec3 uShadowTint;
uniform vec3 uHighlightTint;
uniform float uTintStrength;
uniform float uTintPivot;
uniform float uTintRange;
uniform float uDither;
uniform float uRaw;

const vec3 LUMA = vec3( 0.2126, 0.7152, 0.0722 );

vec3 halcyonRRTAndODTFit( vec3 v ) {
  vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
  vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
  return a / b;
}

// Same fit three.js uses for ACESFilmicToneMapping, inlined so that switching
// post processing off does not change the look of the game.
vec3 halcyonACES( vec3 color ) {
  const mat3 ACESInputMat = mat3(
    vec3( 0.59719, 0.07600, 0.02840 ),
    vec3( 0.35458, 0.90834, 0.13383 ),
    vec3( 0.04823, 0.01566, 0.83777 )
  );
  const mat3 ACESOutputMat = mat3(
    vec3(  1.60475, -0.10208, -0.00327 ),
    vec3( -0.53108,  1.10813, -0.07276 ),
    vec3( -0.07367, -0.00605,  1.07602 )
  );
  color /= 0.6;
  color = ACESInputMat * color;
  color = halcyonRRTAndODTFit( color );
  color = ACESOutputMat * color;
  return clamp( color, 0.0, 1.0 );
}

vec3 srgbOETF( vec3 c ) {
  c = max( c, vec3( 0.0 ) );
  return mix( c * 12.92, 1.055 * pow( c, vec3( 0.41666667 ) ) - 0.055, step( 0.0031308, c ) );
}

float hash12( vec2 p ) {
  vec3 p3 = fract( vec3( p.xyx ) * 0.1031 );
  p3 += dot( p3, p3.yzx + 33.33 );
  return fract( ( p3.x + p3.y ) * p3.z );
}

void main() {
  vec2 cc = vUv - 0.5;
  float r2 = dot( cc, cc );

  // Lateral chromatic aberration, radial and quadratic so the centre of frame
  // is untouched and only the extreme corners fringe. Anything stronger than a
  // couple of thousandths reads as a broken monitor.
  vec2 off = cc * uCA * r2 * 4.0;
  vec3 col;
  col.r = texture2D( tDiffuse, vUv + off ).r;
  col.g = texture2D( tDiffuse, vUv ).g;
  col.b = texture2D( tDiffuse, vUv - off ).b;

  // Diagnostic escape hatch. Every debug view upstream of here is a raw 0..1
  // quantity, and running a raw quantity through ACES, contrast, gain and an
  // sRGB curve turns 0.65 into 0.93 and makes it impossible to tell a working
  // occlusion pass from a dead one by measuring pixels. So when a debug view is
  // on, the grade steps aside completely.
  if ( uRaw > 0.5 ) { gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 ); return; }

  // Split tone, in linear, before the tone curve. Warm sun into the highlights,
  // cool sky into the shade. Both tints are luminance normalised on the CPU so
  // this only moves hue, never overall exposure.
  float l = dot( col, LUMA );
  float m = smoothstep( uTintPivot, uTintPivot + uTintRange, l );
  col *= mix( vec3( 1.0 ), mix( uShadowTint, uHighlightTint, m ), uTintStrength );

  col = halcyonACES( col );

  col = ( col - 0.5 ) * uContrast + 0.5;
  float g = dot( col, LUMA );
  col = mix( vec3( g ), col, uSaturation );
  col = clamp( col, 0.0, 1.0 ) * uGain;

  // Coloured lift. ACES has a hard toe and will crush a shaded archway to
  // literal zero, which is the one thing hard sunlight never does: the darkest
  // surface in the frame is still facing a bright sky and reads as a dim blue.
  // A neutral lift would only turn that black into grey, so the lift carries
  // the sky's own hue.
  float shadowMask = 1.0 - smoothstep( 0.0, uLiftRange, dot( col, LUMA ) );
  col += uLiftColor * uLift * shadowMask;

  col = pow( max( col, vec3( 0.0 ) ), vec3( 1.0 / uGamma ) );

  float d = length( cc ) * 1.41421356;
  col *= 1.0 - uVignette * smoothstep( uVignetteSoftness, 1.0, d );

  col = srgbOETF( clamp( col, 0.0, 1.0 ) );

  // Ordered noise below one 8 bit step. Costs nothing, and it is the difference
  // between a smooth sky and a sky with rings in it.
  col += ( hash12( gl_FragCoord.xy ) - 0.5 ) * uDither / 255.0;

  gl_FragColor = vec4( col, 1.0 );
}
`,U=new m;class ce extends S{constructor(e,t,s){super(),this.scene=e,this.camera=t,this.target=s,this.needsSwap=!1}render(e){e.setRenderTarget(this.target),e.render(this.scene,this.camera)}}class k extends S{constructor(e,t){super(),this.material=e,this.target=t,this.needsSwap=!1,this._quad=new y(e)}render(e){e.setRenderTarget(this.target),this._quad.render(e)}dispose(){this._quad.dispose(),this.material.dispose()}}class O extends S{constructor(e,t=null){super(),this.material=e,this.textureID=t,this._quad=new y(e)}render(e,t,s){this.textureID&&this.material.uniforms[this.textureID]&&(this.material.uniforms[this.textureID].value=s.texture),e.setRenderTarget(this.renderToScreen?null:t),this._quad.render(e)}dispose(){this._quad.dispose(),this.material.dispose()}}class fe extends _{constructor(e,t,s,o,a){super(e,t,s,o),this._scale=a}setSize(e,t){const s=(this._scale??.5)*2;super.setSize(Math.max(4,Math.round(e*s)),Math.max(4,Math.round(t*s)))}}class pe{constructor(e){this.ctx=e,this.scene=e.three.scene,this.renderer=e.three.renderer,this.camera=e.three.camera,this.enabled=i.enabled!==!1,this._ready=!1,this._failed=!1,this._w=1,this._h=1}init(){try{this._build(),this._ready=!0}catch(e){this._failed=!0,console.warn("[postfx] disabled, falling back to direct render:",e?.message??e)}}_build(){const e=this.renderer,t=e.getSize(new h),s=e.getPixelRatio();this._w=t.x,this._h=t.y;const o=Math.max(2,Math.round(t.x*s)),a=Math.max(2,Math.round(t.y*s));this._depth=new Y(o,a,$),this._depth.minFilter=L,this._depth.magFilter=L,this._sceneRT=new v(o,a,{type:g,minFilter:b,magFilter:b,depthBuffer:!0,stencilBuffer:!1,depthTexture:this._depth,samples:Math.max(0,i.msaaSamples|0)}),this._sceneRT.texture.name="halcyon.scene";const r=P.clamp(i.ssaoResolutionScale,.25,1),l=Math.max(2,Math.round(o*r)),n=Math.max(2,Math.round(a*r)),p={type:g,format:Z,minFilter:b,magFilter:b,depthBuffer:!1,stencilBuffer:!1};this._aoRT=new v(l,n,p),this._aoBlurRT=new v(l,n,p),this._aoHeight=n;const f=new v(o,a,{type:g,minFilter:b,magFilter:b,depthBuffer:!1,stencilBuffer:!1}),c=new se(e,f);c.setPixelRatio(1),this.composer=c,c.addPass(new ce(this.scene,this.camera,this._sceneRT));const w=Math.max(4,i.ssaoSamples|0),I=i.contact!==!1,M={SAMPLES:w};I&&(M.USE_CONTACT="",M.CONTACT_STEPS=Math.max(4,i.contactSteps|0)),this._aoMaterial=new d({name:"HalcyonAO",defines:M,uniforms:{tDepth:{value:this._depth},uProj:{value:new B},uProjInv:{value:new B},uResolution:{value:new h(l,n)},uKernel:{value:de(w)},uRadius:{value:i.ssaoRadius},uRadiusRef:{value:i.ssaoRadiusRefDepth??16},uRadiusGrow:{value:i.ssaoRadiusGrowMax??3},uBias:{value:i.ssaoBias},uBiasSlope:{value:i.ssaoBiasSlope??0},uBiasMaxFraction:{value:i.ssaoBiasMaxFraction??.25},uPower:{value:i.ssaoPower},uFadeStart:{value:i.ssaoFadeStart},uFadeEnd:{value:i.ssaoFadeEnd},uSunView:{value:new m(0,1,0)},uPixelScale:{value:n*.5},uContactLength:{value:i.contactLength??.5},uContactThickness:{value:i.contactThickness??.3},uContactMinDepth:{value:i.contactMinDepth??.006},uContactPower:{value:i.contactPower??.8},uContactMinPixels:{value:i.contactMinPixels??24},uContactMaxStretch:{value:i.contactMaxStretch??24},uContactFadeStart:{value:i.contactFadeStart??150},uContactFadeEnd:{value:i.contactFadeEnd??280}},vertexShader:T,fragmentShader:ne,depthTest:!1,depthWrite:!1,toneMapped:!1}),this._aoPass=new k(this._aoMaterial,this._aoRT),this._aoPass.enabled=i.ssao!==!1,c.addPass(this._aoPass);const z=i.ssaoBlurRadius??1;this._aoBlurMaterial=new d({name:"HalcyonAOBlur",uniforms:{tAO:{value:this._aoRT.texture},tDepth:{value:this._depth},uProjInv:{value:this._aoMaterial.uniforms.uProjInv.value},uTexel:{value:new h(z/l,z/n)},uDepthSigma:{value:i.ssaoBlurDepthSigma}},vertexShader:T,fragmentShader:le,depthTest:!1,depthWrite:!1,toneMapped:!1}),this._aoBlurPass=new k(this._aoBlurMaterial,this._aoBlurRT),this._aoBlurPass.enabled=i.ssao!==!1,c.addPass(this._aoBlurPass),this._resolveMaterial=new d({name:"HalcyonResolve",defines:i.ssao!==!1?{USE_AO:""}:{},uniforms:{tScene:{value:this._sceneRT.texture},tAO:{value:this._aoBlurRT.texture},uExposure:{value:R.exposure},uAOIntensity:{value:i.ssaoIntensity},uAOColor:{value:new x(i.ssaoColor)},uContactIntensity:{value:i.contact===!1?0:i.contactIntensity??.9},uContactColor:{value:new x(i.contactColor??5004422)},uDebug:{value:i.debugView??0}},vertexShader:T,fragmentShader:ue,depthTest:!1,depthWrite:!1,toneMapped:!1}),c.addPass(new O(this._resolveMaterial)),this._bloom=new fe(new h(o,a),i.bloomStrength,i.bloomRadius,i.bloomThreshold,P.clamp(i.bloomResolutionScale,.125,1)),this._bloom.enabled=i.bloom!==!1,c.addPass(this._bloom);const C=i.liftGammaGain??{lift:0,gamma:1,gain:1};this._gradeMaterial=new d({name:"HalcyonGrade",uniforms:{tDiffuse:{value:null},uResolution:{value:new h(o,a)},uCA:{value:i.chromaticAberration},uVignette:{value:i.vignette},uVignetteSoftness:{value:i.vignetteSoftness},uSaturation:{value:i.saturation},uContrast:{value:i.contrast},uLift:{value:C.lift},uLiftColor:{value:me(i.shadowLiftColor)},uLiftRange:{value:i.shadowLiftRange??.3},uGamma:{value:C.gamma},uGain:{value:C.gain},uShadowTint:{value:G(i.shadowTint)},uHighlightTint:{value:G(i.highlightTint)},uTintStrength:{value:i.tintStrength},uTintPivot:{value:i.tintPivot},uTintRange:{value:i.tintRange},uDither:{value:i.dither},uRaw:{value:(i.debugView??0)>0?1:0}},vertexShader:T,fragmentShader:he,depthTest:!1,depthWrite:!1,toneMapped:!1}),this._gradePass=new O(this._gradeMaterial,"tDiffuse"),c.addPass(this._gradePass),i.fxaa!==!1&&(this._fxaa=new re,this._fxaa.material.toneMapped=!1,c.addPass(this._fxaa)),c.setSize(o,a),this._syncCamera()}update(){if(!this._ready)return;const e=this.ctx.render?.lighting;this._resolveMaterial.uniforms.uExposure.value=e?.exposure??R.exposure,this.renderer.toneMappingExposure=e?.exposure??R.exposure,this._syncCamera()}_syncCamera(){const e=this.camera,t=this._aoMaterial?.uniforms;if(!t)return;t.uProj.value.copy(e.projectionMatrix),t.uProjInv.value.copy(e.projectionMatrixInverse);const s=this.ctx.render?.lighting?.sunDirection;s&&(U.copy(s).transformDirection(e.matrixWorldInverse).normalize(),t.uSunView.value.copy(U)),t.uPixelScale.value=e.projectionMatrix.elements[5]*.5*this._aoHeight}render(){if(!this.enabled||!this._ready||this._failed){this.renderer.setRenderTarget(null),this.renderer.render(this.scene,this.camera);return}this._syncCamera(),this.composer.render(),this.renderer.setRenderTarget(null)}setSize(e,t){if(!this._ready)return;const s=this.renderer.getPixelRatio(),o=Math.max(2,Math.round(e*s)),a=Math.max(2,Math.round(t*s));if(o===this._sceneRT.width&&a===this._sceneRT.height)return;this._w=e,this._h=t,this._depth.image.width=o,this._depth.image.height=a,this._depth.dispose(),this._sceneRT.setSize(o,a);const r=P.clamp(i.ssaoResolutionScale,.25,1),l=Math.max(2,Math.round(o*r)),n=Math.max(2,Math.round(a*r));this._aoRT.setSize(l,n),this._aoBlurRT.setSize(l,n),this._aoHeight=n,this._aoMaterial.uniforms.uResolution.value.set(l,n);const p=i.ssaoBlurRadius??1;this._aoBlurMaterial.uniforms.uTexel.value.set(p/l,p/n),this._gradeMaterial.uniforms.uResolution.value.set(o,a),this.composer.setPixelRatio(1),this.composer.setSize(o,a)}setEnabled(e){return this.enabled=!!e&&!this._failed,this.enabled}set(e,t){return{exposure:()=>{this._resolveMaterial.uniforms.uExposure.value=t},bloomStrength:()=>{this._bloom&&(this._bloom.strength=t)},bloomThreshold:()=>{this._bloom&&(this._bloom.threshold=t)},bloomRadius:()=>{this._bloom&&(this._bloom.radius=t)},ssao:()=>{this._aoPass&&(this._aoPass.enabled=!!t),this._aoBlurPass&&(this._aoBlurPass.enabled=!!t)},ssaoIntensity:()=>{this._resolveMaterial.uniforms.uAOIntensity.value=t},ssaoRadius:()=>{this._aoMaterial.uniforms.uRadius.value=t},contactIntensity:()=>{this._resolveMaterial.uniforms.uContactIntensity.value=t},contactLength:()=>{this._aoMaterial.uniforms.uContactLength.value=t},contactMinPixels:()=>{this._aoMaterial.uniforms.uContactMinPixels.value=t},contactPower:()=>{this._aoMaterial.uniforms.uContactPower.value=t},chromaticAberration:()=>{this._gradeMaterial.uniforms.uCA.value=t},bloom:()=>{this._bloom&&(this._bloom.enabled=!!t)},saturation:()=>{this._gradeMaterial.uniforms.uSaturation.value=t},contrast:()=>{this._gradeMaterial.uniforms.uContrast.value=t},vignette:()=>{this._gradeMaterial.uniforms.uVignette.value=t},tintStrength:()=>{this._gradeMaterial.uniforms.uTintStrength.value=t},debug:()=>{const o=+t||0;this._resolveMaterial.uniforms.uDebug.value=o,this._gradeMaterial.uniforms.uRaw.value=o>0?1:0,this._bloom&&(this._bloom.enabled=o>0?!1:i.bloom!==!1)}}[e]?.(),this}dispose(){this._sceneRT?.dispose(),this._depth?.dispose(),this._aoRT?.dispose(),this._aoBlurRT?.dispose(),this._bloom?.dispose(),this.composer?.renderTarget1?.dispose(),this.composer?.renderTarget2?.dispose(),this._ready=!1}}function de(u){const e=[],t=Math.PI*(3-Math.sqrt(5));for(let s=0;s<u;s++){const o=(s+.5)/u,a=Math.sqrt(o),r=s*t,l=new m(a*Math.cos(r),a*Math.sin(r),Math.sqrt(Math.max(0,1-o))),n=.22+.78*(s/u)*(s/u);e.push(l.multiplyScalar(n))}return e}function me(u){const e=new x(u),t=Math.max(e.r,e.g,e.b);return t>1e-4&&e.multiplyScalar(1/t),e}function G(u){const e=new x(u),t=.2126*e.r+.7152*e.g+.0722*e.b;return t>1e-4&&e.multiplyScalar(1/t),e}export{pe as PostFX,pe as default};
