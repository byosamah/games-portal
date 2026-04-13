import AnimController from './AnimController.js';
import { CONFIG, SAUDI_WEAPON_BONE } from './config.js';

export default class Player {
  constructor(scene, assets) {
    const data = assets.cloneCharacter('saudi');
    this.mesh = data.scene;
    this.mesh.scale.setScalar(1.4);
    this.mesh.position.set(0, 0, 0);
    scene.add(this.mesh);

    this.anim = new AnimController(this.mesh, data.animations);
    this.anim.play('Idle');

    // Find the RightHand bone for weapon attachment
    this._handBone = null;
    this.mesh.traverse(child => {
      if (child.name === SAUDI_WEAPON_BONE || child.name === 'mixamorigRightHand') {
        this._handBone = child;
      }
    });

    this._assets = assets;
    this._weaponModels = {};
    this._currentWeaponMesh = null;

    this.currentWeapon = 'Pistol';
    this._attachWeapon('Pistol');

    this.health = CONFIG.PLAYER_HEALTH;
    this.maxHealth = CONFIG.PLAYER_HEALTH;
    this.alive = true;
    this.fireCooldown = 0;
    this.wasMoving = false;
    this.contactCooldown = 0;
    this.targetRotY = 0;

    this.position = this.mesh.position;
  }

  _attachWeapon(name) {
    if (!this._handBone) return;

    // Hide current weapon
    if (this._currentWeaponMesh) {
      this._currentWeaponMesh.visible = false;
    }

    // Reuse cached weapon or clone a new one
    if (this._weaponModels[name]) {
      this._weaponModels[name].visible = true;
      this._currentWeaponMesh = this._weaponModels[name];
      return;
    }

    const weaponModel = this._assets.cloneStatic(name.toLowerCase());
    if (!weaponModel) return;

    // Saudi skeleton has 0.01 inherited scale (×1.4 mesh) — weapons need ~71x to compensate
    weaponModel.scale.setScalar(71);
    weaponModel.position.set(0, 0, 5);
    weaponModel.rotation.set(0, 0, 0);

    this._handBone.add(weaponModel);
    this._weaponModels[name] = weaponModel;
    this._currentWeaponMesh = weaponModel;
  }

  setWeapon(name) {
    this.currentWeapon = name;
    this._attachWeapon(name);
  }

  getWeaponStats() { return CONFIG.WEAPONS[this.currentWeapon]; }

  setAimTarget(worldPoint) {
    const dx = worldPoint.x - this.mesh.position.x;
    const dz = worldPoint.z - this.mesh.position.z;
    if (dx !== 0 || dz !== 0) {
      this.targetRotY = Math.atan2(dx, dz);
    }
  }

  update(dt, input, camera) {
    if (!this.alive) return;
    this.fireCooldown -= dt;
    this.contactCooldown -= dt;

    const dir = input.getMoveDir();
    if (dir.moving) {
      this.mesh.position.x += dir.x * CONFIG.PLAYER_SPEED * dt;
      this.mesh.position.z += dir.z * CONFIG.PLAYER_SPEED * dt;
    }

    const h = CONFIG.ARENA_HALF - CONFIG.PLAYER_RADIUS;
    this.mesh.position.x = Math.max(-h, Math.min(h, this.mesh.position.x));
    this.mesh.position.z = Math.max(-h, Math.min(h, this.mesh.position.z));

    let diff = this.targetRotY - this.mesh.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.mesh.rotation.y += diff * Math.min(1, 15 * dt);

    if (dir.moving && !this.wasMoving) this.anim.play('Run_Gun');
    else if (!dir.moving && this.wasMoving) this.anim.play('Idle');
    this.wasMoving = dir.moving;

    this.anim.update(dt);
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      this.anim.playOnce('Death');
    }
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  reset() {
    this.health = CONFIG.PLAYER_HEALTH;
    this.alive = true;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.y = 0;
    this.currentWeapon = 'Pistol';
    // Hide all cached weapons, show pistol
    Object.values(this._weaponModels).forEach(m => m.visible = false);
    this._attachWeapon('Pistol');
    this.fireCooldown = 0;
    this.contactCooldown = 0;
    this.anim.play('Idle', 0);
  }
}
