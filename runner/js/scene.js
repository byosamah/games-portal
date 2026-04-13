import * as THREE from 'three';
import { CONFIG } from './config.js';
import { dom } from './dom.js';

export const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xFFD8A8, 25, 65);

// Sky dome — golden hour gradient
{
  const skyGeo = new THREE.SphereGeometry(80, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPos;
      float smoothstepCustom(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }
      void main() {
        vec3 dir = normalize(vWorldPos);
        float h = dir.y;
        vec3 zenith  = vec3(0.102, 0.227, 0.361);
        vec3 mid     = vec3(0.957, 0.643, 0.376);
        vec3 horizon = vec3(1.0,   0.549, 0.314);
        float tMid = smoothstepCustom(0.0, 0.45, h);
        float tTop = smoothstepCustom(0.35, 0.85, h);
        vec3 col = mix(horizon, mid, tMid);
        col = mix(col, zenith, tTop);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

export const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(CONFIG.camera.x, CONFIG.camera.y, CONFIG.camera.z);
camera.lookAt(0, CONFIG.camera.lookY, 0);
export const baseCamPos = camera.position.clone();
export const baseFOV    = camera.fov;

// Lights — golden hour warmth
scene.add(new THREE.AmbientLight(0xFFF0DB, 0.5));

const sun = new THREE.DirectionalLight(0xFFE4B5, 1.4);
sun.position.set(8, 6, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near   = 0.5;
sun.shadow.camera.far    = 50;
sun.shadow.camera.left   = -25;
sun.shadow.camera.right  =  25;
sun.shadow.camera.top    =  15;
sun.shadow.camera.bottom = -5;
scene.add(sun);
