export class FabricLayer {
  constructor(name, options = {}) {
    this.name = name;
    this.visible = options.visible !== false;
    this.locked = options.locked || false;
    this.isBackground = options.isBackground || false;
    this.objects = []; // Array of Fabric.js objects in this layer
    this.id = this.generateId();
  }

  generateId() {
    return 'layer_' + Math.random().toString(36).substr(2, 9);
  }

  addObject(object) {
    if (!this.objects.includes(object)) {
      this.objects.push(object);
      object.layerId = this.id;
    }
  }

  removeObject(object) {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
      delete object.layerId;
    }
  }

  setVisibility(visible) {
    this.visible = visible;
    this.objects.forEach(obj => {
      obj.visible = visible;
    });
  }

  setLocked(locked) {
    this.locked = locked;
    this.objects.forEach(obj => {
      obj.selectable = !locked;
      obj.evented = !locked;
    });
  }

  show() {
    this.setVisibility(true);
  }

  hide() {
    this.setVisibility(false);
  }

  lock() {
    this.setLocked(true);
  }

  unlock() {
    this.setLocked(false);
  }

  isVisible() {
    return this.visible;
  }

  isLocked() {
    return this.locked;
  }

  getObjectCount() {
    return this.objects.length;
  }

  clear() {
    // Remove all objects from this layer
    this.objects.forEach(obj => {
      delete obj.layerId;
    });
    this.objects = [];
  }

  clone() {
    const clonedLayer = new FabricLayer(`${this.name} Copy`);
    clonedLayer.visible = this.visible;
    clonedLayer.locked = this.locked;
    return clonedLayer;
  }
} 