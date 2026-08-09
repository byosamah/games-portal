import{as as t,V as p,e as h,G as I,aH as x,aI as B,aJ as E,aK as G,aL as H,z as R,aj as A,n as T,aM as N,l as D,aN as P,a1 as f,aO as C}from"./main-BM5PwmOq.js";const m=Math.PI/180,k=new p,v=new p,_=new p,S=new p,M=new p,b=new p,O=new h,U="float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {",L="// cubeToUV() maps a 3D direction vector";function V(c){const o=Math.max(4,c.shadowSearchTaps|0),e=Math.max(4,c.shadowFilterTaps|0),s=(+c.shadowPenumbraMinTexels||1).toFixed(4),a=(+c.shadowPenumbraMaxTexels||8).toFixed(4),i=(+c.shadowSlopeBiasMaxPerTexel||.0035).toFixed(7),r=(o+.5).toFixed(1);return`
	// --- HALCYON PCSS ------------------------------------------------------
	float halcyonIGN( vec2 p ) {
		return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) );
	}

	// Vogel disc with a per pixel RADIAL offset as well as a per pixel rotation.
	// Rotation alone leaves every pixel sampling the same set of radii, and a
	// fixed set of radii is exactly what lines up with the shadow map's texel
	// grid and turns a shaded floor into rectangular blocks.
	vec2 halcyonDisc( float i, float n, float phi, float jitter ) {
		float r = sqrt( ( i + jitter ) / n );
		float th = i * 2.39996323 + phi;
		return vec2( r * cos( th ), r * sin( th ) );
	}

	float halcyonLit( float d, float z ) {
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( d, z );
		#else
			return step( z, d );
		#endif
	}

	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

		vec3 sc = shadowCoord.xyz / shadowCoord.w;
		float z = sc.z + shadowBias;

		bool inFrustum = sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0;
		if ( ! ( inFrustum && z <= 1.0 ) ) return 1.0;

		vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

		// RECEIVER PLANE DEPTH BIAS. Every tap below is offset in the shadow
		// map's UV plane, and a sloped receiver is at a DIFFERENT depth over
		// there. Compared against one constant depth, a floor raking away from
		// the sun reads as its own blocker a few texels out: the blocker search
		// then averages the receiver instead of the caster, the penumbra
		// estimate saturates, and the result is either a grid of rectangular
		// blocks or one shapeless mush depending on which way the slope runs.
		//
		// So recover d(depth)/d(u) and d(depth)/d(v) for the surface under this
		// pixel from its screen space derivatives, and compare every tap against
		// the receiver's OWN plane. Isidoro 2006. It is the difference between a
		// shadow that has an edge and a shadow that has an aliasing pattern.
		vec3 ddx = dFdx( sc );
		vec3 ddy = dFdy( sc );
		float det = ddx.x * ddy.y - ddx.y * ddy.x;
		vec2 dzduv = vec2( 0.0 );
		if ( abs( det ) > 1e-12 ) {
			dzduv.x = (  ddy.y * ddx.z - ddx.y * ddy.z ) / det;
			dzduv.y = ( -ddy.x * ddx.z + ddx.x * ddy.z ) / det;
		}
		// Clamped, because across a silhouette the derivative straddles two
		// surfaces and an unclamped plane bias would leak light through it.
		vec2 slopeCap = vec2( ${i} ) / texelSize;
		dzduv = clamp( dzduv, -slopeCap, slopeCap );

		float phi = halcyonIGN( gl_FragCoord.xy ) * 6.2831853;
		float jit = clamp( halcyonIGN( gl_FragCoord.yx + vec2( 11.37, 7.13 ) ), 0.04, 0.96 );

		// 1. blocker search, centre tap first so a fragment deep inside a shadow
		//    can never miss its own occluder and flash to full sun.
		float dC = unpackRGBAToDepth( texture2D( shadowMap, sc.xy ) );
		float numB = 1.0 - halcyonLit( dC, z );
		float sumB = dC * numB;

		for ( int i = 0; i < ${o}; i ++ ) {
			vec2 o = halcyonDisc( float( i ), ${o}.0, phi, jit ) * ${a} * texelSize;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			float b = 1.0 - halcyonLit( d, z + dot( o, dzduv ) );
			sumB += d * b;
			numB += b;
		}

		// Nothing in front of us anywhere in the search disc: full sun, done.
		if ( numB < 0.5 ) return 1.0;
		// ...and everything in front of us everywhere in it: full umbra, done.
		// The penumbra can never be wider than the search disc, so there is
		// nothing for the filter to find. Most of a cast shadow exits here,
		// which is what pays for a 24 tap filter on the edge that is left.
		if ( numB > ${r} ) return mix( 1.0, 0.0, shadowIntensity );

		float avgB = sumB / numB;
		float penumbra = clamp( abs( z - avgB ) * shadowRadius, ${s}, ${a} );

		// 2. variable radius PCF
		float sum = 0.0;
		for ( int i = 0; i < ${e}; i ++ ) {
			vec2 o = halcyonDisc( float( i ), ${e}.0, phi + 1.13, 1.0 - jit ) * penumbra * texelSize;
			float d = unpackRGBAToDepth( texture2D( shadowMap, sc.xy + o ) );
			sum += halcyonLit( d, z + dot( o, dzduv ) );
		}

		return mix( 1.0, sum * ( 1.0 / ${e}.0 ), shadowIntensity );

	}

	`}function $(c){if(c.shadowPcss===!1)return!1;try{const o=C.shadowmap_pars_fragment;if(typeof o!="string")return!1;if(o.includes("HALCYON PCSS"))return!0;const e=o.indexOf(U),s=o.indexOf(L);return e<0||s<0||s<=e?!1:(C.shadowmap_pars_fragment=o.slice(0,e)+V(c)+o.slice(s),!0)}catch{return!1}}function j(c){if(c.renderOrder>=2e3||c.renderOrder<=-500)return!0;const o=c.material,e=Array.isArray(o)?o:[o];for(const s of e)if(s&&(s.depthWrite===!1||s.depthTest===!1))return!0;return!1}const Z=`
varying vec3 vDir;
void main() {
  vDir = normalize( ( modelMatrix * vec4( position, 1.0 ) ).xyz - cameraPosition );
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
`,W=`
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uHaze;
uniform vec3 uGround;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uZenithFalloff;
uniform float uHazeHeight;
uniform float uHazeStrength;
uniform float uGroundFalloff;
uniform float uGlowExp;
uniform float uGlowStrength;
uniform float uHaloExp;
uniform float uHaloStrength;
uniform float uDiscInner;
uniform float uDiscOuter;
uniform float uDiscStrength;
uniform float uIntensity;
varying vec3 vDir;

void main() {
  vec3 dir = normalize( vDir );
  float h = dir.y;

  // Upper hemisphere: horizon pale, zenith saturated. The exponent is what
  // decides whether the blue "sits on" the horizon or floats above it.
  float up = clamp( h, 0.0, 1.0 );
  vec3 col = mix( uHorizon, uZenith, pow( up, uZenithFalloff ) );

  // The haze band. In hot dry air this is the brightest part of the sky away
  // from the sun, and it is what the fog colour is sampled from.
  float band = exp( -max( h, 0.0 ) / uHazeHeight );
  col = mix( col, uHaze, band * uHazeStrength );

  // Below the horizon the "sky" is really warm bounce off stone and sand. The
  // environment map reads this half, which is where downward faces get their
  // colour from.
  float down = clamp( -h, 0.0, 1.0 );
  col = mix( col, uGround, smoothstep( 0.0, uGroundFalloff, down ) );

  float cosA = dot( dir, uSunDir );
  float c = max( cosA, 0.0 );

  // Wide halo, tight glow, then the disc itself. The disc value is far above 1
  // on purpose: it is the only thing in the frame that has any business
  // triggering bloom on its own.
  col += uSunColor * pow( c, uHaloExp ) * uHaloStrength;
  col += uSunColor * pow( c, uGlowExp ) * uGlowStrength;
  float ang = acos( clamp( cosA, -1.0, 1.0 ) );
  col += uSunColor * ( 1.0 - smoothstep( uDiscInner, uDiscOuter, ang ) ) * uDiscStrength;

  gl_FragColor = vec4( col * uIntensity, 1.0 );
}
`;class q{constructor(o){this.ctx=o,this.scene=o.three.scene,this.renderer=o.three.renderer,this.camera=o.three.camera,this.t=t.timeOfDay,this.exposure=t.exposure,this.sunDirection=new p(0,1,0),this.horizonColor=new h,this.zenithColor=new h,this.hazeColor=new h,this.sunTint=new h,this._ownsBackground=!1,this._pcss=$(t),this._lastRadius=-1,this._sweepFrame=0,this._lastChildCount=-1,this._lastGeoCount=-1,this._envDirty=!0,this._disposed=!1,this._buildRig(),this._buildSky()}_buildRig(){const o=this.scene,e=new I;e.name="lighting-rig",o.add(e),this._group=e;const s=new x(16773844,t.sunIntensity);s.name="sun",s.castShadow=!0,s.shadow.mapSize.set(t.shadowMapSize,t.shadowMapSize),s.shadow.radius=t.shadowSoftness,s.shadow.bias=t.shadowBias,s.shadow.normalBias=t.shadowNormalBias,s.shadow.camera.near=.5,s.shadow.camera.far=400,s.shadow.autoUpdate=!0,e.add(s),e.add(s.target),this._sun=s;const a=new B(9422824,13215874,t.hemiIntensity);a.name="sky-fill",e.add(a),this._hemi=a;const i=new E(t.ambientFloorColor??10333387,t.ambientFloorIntensity??.1);i.name="sky-floor",e.add(i),this._floor=i;const r=new x(14067836,t.bounceIntensity);r.name="ground-bounce",r.castShadow=!1,e.add(r),e.add(r.target),this._bounce=r;const n=new x(13494010,t.rimIntensity);n.name="sky-rim",n.castShadow=!1,e.add(n),e.add(n.target),this._rim=n,this._exp2=t.fogMode!=="linear",this._fog=this._exp2?new G(15457476,t.fogDensity):new H(15457476,t.fogNear,t.fogFar),o.fog=this._fog}_buildSky(){this._skyUniforms={uZenith:{value:new h(3053272)},uHorizon:{value:new h(13887987)},uHaze:{value:new h(15457476)},uGround:{value:new h(13215874)},uSunDir:{value:new p(0,1,0)},uSunColor:{value:new h(16773844)},uZenithFalloff:{value:t.zenithFalloff},uHazeHeight:{value:t.hazeHeight},uHazeStrength:{value:t.hazeStrength},uGroundFalloff:{value:t.groundFalloff},uGlowExp:{value:1},uGlowStrength:{value:t.sunGlowStrength},uHaloExp:{value:1},uHaloStrength:{value:t.sunHaloStrength},uDiscInner:{value:1},uDiscOuter:{value:1},uDiscStrength:{value:t.sunDiscStrength},uIntensity:{value:t.skyIntensity}};const o=s=>Math.log(.5)/Math.log(Math.max(1e-4,Math.cos(s*m)));this._skyUniforms.uGlowExp.value=o(t.sunGlowDeg),this._skyUniforms.uHaloExp.value=o(t.sunHaloDeg),this._skyUniforms.uDiscInner.value=t.sunDiscDeg*.55*m,this._skyUniforms.uDiscOuter.value=t.sunDiscDeg*m,this._skyMaterial=new R({name:"HalcyonSky",uniforms:this._skyUniforms,vertexShader:Z,fragmentShader:W,side:A,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!1}),this._skyGeometry=new T(1,32,20),this._probeScene=new N;const e=new D(this._skyGeometry,this._skyMaterial);e.scale.setScalar(20),e.frustumCulled=!1,this._probeScene.add(e),this._probe=e,this._pmrem=new P(this.renderer)}init(){if(!this.ctx.world?.sky){const s=new D(this._skyGeometry,this._skyMaterial);s.name="sky-dome",s.scale.setScalar(t.skyDomeRadius),s.frustumCulled=!1,s.renderOrder=-1e3,s.matrixAutoUpdate=!0,this.scene.add(s),this._dome=s,this._ownsBackground=!0,this.scene.background=new h(15457476)}this.renderer.shadowMap.enabled=!0,this.setTimeOfDay(this.t),this._fitShadow(),t.autoShadowSweep&&this._sweepShadows()}setTimeOfDay(o){if(!Number.isFinite(o))return;this.t=f.clamp(o,0,1);const e=this._sampleTimeline(this.t),s=Math.pow(Math.max(0,Math.sin(Math.PI*this.t)),t.elevationCurve),a=Math.max(t.elevationMinDeg,t.sunElevationDeg*s)*m,i=(t.sunAzimuthDeg+(this.t-.5)*2*t.sunAzimuthSweepDeg)*m,r=Math.cos(a);this.sunDirection.set(Math.cos(i)*r,Math.sin(a),Math.sin(i)*r).normalize(),this._sun.color.copy(e.sun),this._sun.intensity=t.sunIntensity*e.sunMul,this.sunTint.copy(e.sun),this._hemi.color.copy(e.hemiSky),this._hemi.groundColor.copy(e.hemiGround),this._hemi.intensity=t.hemiIntensity*e.ambientMul,this._floor&&(this._floor.color.setHex(t.ambientFloorColor??10333387).lerp(e.hemiSky,.25),this._floor.intensity=(t.ambientFloorIntensity??.1)*e.ambientMul);const n=i+t.bounceAzimuthOffsetDeg*m,u=t.bounceElevationDeg*m,d=Math.cos(u);this._bounce.position.set(Math.cos(n)*d,Math.sin(u),Math.sin(n)*d).multiplyScalar(60),this._bounce.target.position.set(0,0,0),this._bounce.color.copy(e.bounce),this._bounce.intensity=t.bounceIntensity*e.ambientMul;const y=i+t.rimAzimuthOffsetDeg*m,g=t.rimElevationDeg*m,w=Math.cos(g);this._rim.position.set(Math.cos(y)*w,Math.sin(g),Math.sin(y)*w).multiplyScalar(60),this._rim.target.position.set(0,0,0),this._rim.color.copy(e.rim),this._rim.intensity=t.rimIntensity;const l=this._skyUniforms;l.uZenith.value.copy(e.zenith),l.uHorizon.value.copy(e.horizon),l.uHaze.value.copy(e.haze),l.uGround.value.copy(e.ground),l.uSunColor.value.copy(e.sun),l.uSunDir.value.copy(this.sunDirection),l.uIntensity.value=t.skyIntensity*e.skyMul,this.zenithColor.copy(e.zenith),this.horizonColor.copy(e.horizon),this.hazeColor.copy(e.haze),this._fog.color.copy(e.haze).lerp(e.horizon,t.fogHorizonBlend??.35),this._exp2?this._fog.density=t.fogDensity:(this._fog.near=e.fogNear,this._fog.far=e.fogFar),this.fogNear=e.fogNear,this.fogFar=e.fogFar,this._ownsBackground&&this.scene.background?.isColor&&this.scene.background.copy(this._fog.color),this.exposure=t.exposure*e.exposureMul,this.ambientIntensity=t.ambientIntensity*e.ambientMul,this.scene.environmentIntensity=this.ambientIntensity,this.renderer.toneMappingExposure=this.exposure,this._envDirty=!0,this._updateEnvironment()}_sampleTimeline(o){const e=t.timeline;let s=e[0],a=e[e.length-1];for(let d=0;d<e.length-1;d++)if(o>=e[d].t&&o<=e[d+1].t){s=e[d],a=e[d+1];break}const i=Math.max(1e-6,a.t-s.t),r=f.clamp((o-s.t)/i,0,1),n=this._sample??={sun:new h,zenith:new h,horizon:new h,haze:new h,ground:new h,hemiSky:new h,hemiGround:new h,bounce:new h,rim:new h},u=d=>n[d].setHex(s[d]).lerp(O.setHex(a[d]),r);return u("sun"),u("zenith"),u("horizon"),u("haze"),u("ground"),u("hemiSky"),u("hemiGround"),u("bounce"),u("rim"),n.sunMul=f.lerp(s.sunMul,a.sunMul,r),n.ambientMul=f.lerp(s.ambientMul,a.ambientMul,r),n.fogNear=f.lerp(s.fogNear,a.fogNear,r),n.fogFar=f.lerp(s.fogFar,a.fogFar,r),n.exposureMul=f.lerp(s.exposureMul,a.exposureMul,r),n.skyMul=f.lerp(s.skyMul,a.skyMul,r),n}_updateEnvironment(){if(!(!this._envDirty||this._disposed)){this._envDirty=!1;try{const o=this._pmrem.fromScene(this._probeScene,0,1,200);this._envTarget?.dispose(),this._envTarget=o,this.scene.environment=o.texture,this.environmentMap=o.texture}catch(o){console.warn("[lighting] environment bake skipped:",o?.message??o)}}}update(o,e,s){this._dome&&this._dome.position.copy(this.camera.position),this._fitShadow(),t.autoShadowSweep&&this._maybeSweep()}_fitShadow(){const o=this.camera,e=this._sun;k.set(0,0,-1).applyQuaternion(o.quaternion);const s=this.ctx.player?.position;let a=s?o.position.distanceTo(s):14;Number.isFinite(a)||(a=14),a=f.clamp(a,3,t.shadowDistance),v.copy(o.position).addScaledVector(k,a);let i=t.shadowRadiusBase+a*t.shadowRadiusPerMetre;i=f.clamp(i,t.shadowRadiusMin,t.shadowRadiusMax);const r=Math.max(.25,t.shadowRadiusQuantum);i=Math.ceil(i/r)*r;const n=2*i/t.shadowMapSize,u=this.sunDirection;M.set(0,1,0),Math.abs(u.y)>.995&&M.set(0,0,1),_.copy(M).cross(u).normalize(),S.copy(u).cross(_).normalize();const d=Math.round(v.dot(_)/n)*n,y=Math.round(v.dot(S)/n)*n,g=v.dot(u);b.set(0,0,0).addScaledVector(_,d).addScaledVector(S,y).addScaledVector(u,g);const w=t.shadowBackDistance+i;e.target.position.copy(b),e.position.copy(b).addScaledVector(u,w),e.target.updateMatrixWorld();const l=e.shadow.camera;if(i!==this._lastRadius){this._lastRadius=i,l.left=-i,l.right=i,l.top=i,l.bottom=-i,l.near=.5,l.far=w+i+t.shadowDepthPadding,l.updateProjectionMatrix();const z=l.far-l.near;if(e.shadow.bias=-(t.shadowBiasMetres/z),e.shadow.normalBias=Math.max(t.shadowNormalBias,n*t.shadowNormalBiasTexels),this._pcss){const F=(t.shadowSunAngleDeg??1.5)*m;e.shadow.radius=z*F/Math.max(1e-6,n)}}}_sweepShadows(){const o=t.shadowCasterMaxRadius,e=t.shadowReceiverMaxRadius??1/0;this.scene.traverse(s=>{if(!s.isMesh||s===this._dome||s.userData?.noShadow===!0)return;let a=0;const i=s.geometry;if(i&&(i.boundingSphere||i.computeBoundingSphere(),a=(i.boundingSphere?.radius??0)*Math.max(Math.abs(s.scale.x),Math.abs(s.scale.y),Math.abs(s.scale.z))),j(s)){s.castShadow=!1,s.receiveShadow=!1;return}if(a>o&&(s.castShadow=!1),a>e&&(s.receiveShadow=!1),s.castShadow||s.receiveShadow)return;const r=s.material;(Array.isArray(r)?r.some(n=>n?.transparent&&n.opacity<.35):r?.transparent&&r.opacity<.35)||(s.castShadow=a>0&&a<=o,s.receiveShadow=a<=e)}),this._lastChildCount=this.scene.children.length,this._lastGeoCount=this.renderer.info.memory.geometries}_maybeSweep(){if(this._sweepFrame++,(this._sweepFrame&15)!==0)return;const o=this.scene.children.length,e=this.renderer.info.memory.geometries;o===this._lastChildCount&&e===this._lastGeoCount||this._sweepShadows()}get sun(){return this._sun}get hemi(){return this._hemi}get fog(){return this._fog}get timeOfDay(){return this.t}state(){return{t:this.t,sunDirection:this.sunDirection,sunColor:this.sunTint,sunIntensity:this._sun.intensity,zenith:this.zenithColor,horizon:this.horizonColor,haze:this.hazeColor,fogColor:this._fog.color,fogNear:this.fogNear??t.fogNear,fogFar:this.fogFar??t.fogFar,fogDensity:this._exp2?this._fog.density:0,exposure:this.exposure,environment:this.environmentMap??null}}applyShadowDefaults(o,{cast:e=!0,receive:s=!0}={}){o?.traverse?.(a=>{a.isMesh&&(a.castShadow=e,a.receiveShadow=s)})}get ambientFloor(){return this._floor}dispose(){this._disposed=!0,this._envTarget?.dispose(),this._pmrem?.dispose(),this._skyMaterial?.dispose(),this._skyGeometry?.dispose(),this._dome&&this.scene.remove(this._dome),this._group&&this.scene.remove(this._group),this.scene.environment=null}}export{q as Lighting,q as default};
