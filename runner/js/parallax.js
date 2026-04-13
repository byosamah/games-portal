import * as THREE from 'three';
import { ASSETS } from './config.js';
import { gameState } from './state.js';
import { scene } from './scene.js';
import { normalizeModel, getMeshOnlyBox } from './model-cache.js';

export function createGroundTiles(cache) {
  // Measure tile dimensions from a probe clone
  const grassProbe = cache.clone(ASSETS.ground);
  grassProbe.updateMatrixWorld(true);
  const grassBox  = getMeshOnlyBox(grassProbe);
  const grassSize = grassBox.getSize(new THREE.Vector3());
  gameState.groundTileWidth = grassSize.x || 1;
  const grassTopY = grassBox.max.y;

  // Tile enough blocks to cover scroll range + buffer
  gameState.groundTileCount = Math.ceil(90 / gameState.groundTileWidth) + 4;
  const halfSpan = (gameState.groundTileCount * gameState.groundTileWidth) / 2;

  for (let i = 0; i < gameState.groundTileCount; i++) {
    const tile = cache.clone(ASSETS.ground);
    tile.position.set(
      i * gameState.groundTileWidth - halfSpan,
      -grassTopY,
      0
    );
    tile.traverse(c => { if (c.isMesh) c.receiveShadow = true; });
    scene.add(tile);
    gameState.groundTiles.push(tile);
  }

  // Dirt row beneath z=0 grass
  const dirtProbe = cache.clone(ASSETS.dirt);
  dirtProbe.updateMatrixWorld(true);
  const dirtBox  = getMeshOnlyBox(dirtProbe);
  const dirtSize = dirtBox.getSize(new THREE.Vector3());

  {
    const strip = { tiles: [], tileWidth: gameState.groundTileWidth, tileCount: gameState.groundTileCount, speed: 1.0 };
    for (let i = 0; i < gameState.groundTileCount; i++) {
      const tile = cache.clone(ASSETS.dirt);
      tile.position.set(
        i * gameState.groundTileWidth - halfSpan,
        -grassTopY - dirtSize.y,
        0
      );
      tile.traverse(c => { if (c.isMesh) c.receiveShadow = true; });
      scene.add(tile);
      strip.tiles.push(tile);
    }
    gameState.groundStrips.push(strip);
  }

  // Green fill plane beneath blocks
  const groundFill = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 60),
    new THREE.MeshStandardMaterial({ color: 0x4a8c3a })
  );
  groundFill.rotation.x = -Math.PI / 2;
  groundFill.position.y = -0.01;
  groundFill.position.z = -8;
  groundFill.receiveShadow = true;
  scene.add(groundFill);

  // Helper: create a parallax ground strip at a given z-depth
  function makeGroundStrip(z, tileCount, speedFactor) {
    const strip = { tiles: [], tileWidth: gameState.groundTileWidth, tileCount, speed: speedFactor };
    const hs = (tileCount * gameState.groundTileWidth) / 2;
    for (let i = 0; i < tileCount; i++) {
      const tile = cache.clone(ASSETS.ground);
      tile.position.set(i * gameState.groundTileWidth - hs, -grassTopY, z);
      tile.traverse(c => { if (c.isMesh) c.receiveShadow = true; });
      scene.add(tile);
      strip.tiles.push(tile);
    }
    gameState.groundStrips.push(strip);
  }

  makeGroundStrip(-2,  30, 0.7);
  makeGroundStrip(-6,  25, 0.4);
  makeGroundStrip(-12, 20, 0.15);
}

export function createParallaxLayers(cache) {
  function makeGLTFParallaxLayer(paths, count, heightRange, z, speed) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const path  = paths[Math.floor(Math.random() * paths.length)];
      const clone = cache.clone(path);
      const h = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      normalizeModel(clone, h);
      clone.rotation.y = Math.random() * Math.PI * 2;
      clone.position.x = (Math.random() - 0.5) * 90;
      clone.position.z = z;
      group.add(clone);
    }
    scene.add(group);
    gameState.parallaxLayers.push({ group, speedFactor: speed });
  }

  makeGLTFParallaxLayer(ASSETS.far,  10, [4, 8],     -15, 0.15);
  makeGLTFParallaxLayer(ASSETS.mid,  10, [2, 4],      -8, 0.4);
  makeGLTFParallaxLayer(ASSETS.near, 12, [0.5, 1.5],  -3, 0.7);
  makeGLTFParallaxLayer(ASSETS.groundDetail, 14, [0.2, 0.5], -1, 0.85);
}

export function createClouds() {
  function createCloud() {
    const cloud = new THREE.Group();
    const puffCount = 4 + Math.floor(Math.random() * 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      fog: false,
    });
    for (let i = 0; i < puffCount; i++) {
      const r = 0.8 + Math.random() * 1.2;
      const geo = new THREE.SphereGeometry(r, 7, 5);
      const puff = new THREE.Mesh(geo, mat);
      puff.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 1.5
      );
      puff.scale.y *= 0.5;
      cloud.add(puff);
    }
    return cloud;
  }

  const cloudGroup = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const cloud = createCloud();
    cloud.position.set(
      (Math.random() - 0.5) * 120,
      8 + Math.random() * 10,
      -5 - Math.random() * 25
    );
    const s = 0.8 + Math.random() * 1.5;
    cloud.scale.set(s, s * 0.6, s);
    cloudGroup.add(cloud);
  }
  scene.add(cloudGroup);
  gameState.cloudGroup = cloudGroup;
}

export function resetGroundTiles() {
  const span = gameState.groundTileCount * gameState.groundTileWidth;
  for (let i = 0; i < gameState.groundTiles.length; i++) {
    gameState.groundTiles[i].position.x = i * gameState.groundTileWidth - span / 2;
  }
  gameState.groundStrips.forEach(strip => {
    const hs = (strip.tileCount * strip.tileWidth) / 2;
    for (let i = 0; i < strip.tiles.length; i++) {
      strip.tiles[i].position.x = i * strip.tileWidth - hs;
    }
  });
}
