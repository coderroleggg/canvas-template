import { FabricLayer } from './FabricLayer.js';

export class FabricLayerManager {
  constructor(canvas) {
    this.canvas = canvas; // Canvas instance (our wrapper)
    this.fabricCanvas = canvas.canvas; // Fabric.js canvas
    this.layers = [];
    this.activeLayerIndex = 0;
    
    // Create default background layer
    this.addLayer('Background', { isBackground: true });
    
    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for object added events
    this.fabricCanvas.on('object:added', (e) => {
      this.handleObjectAdded(e.target);
    });

    // Listen for object removed events
    this.fabricCanvas.on('object:removed', (e) => {
      this.handleObjectRemoved(e.target);
    });
  }

  handleObjectAdded(object) {
    // Add object to active layer if it doesn't belong to any layer
    if (!object.layerId) {
      const activeLayer = this.getActiveLayer();
      if (activeLayer) {
        activeLayer.addObject(object);
      }
    }
  }

  handleObjectRemoved(object) {
    // Remove object from its layer
    if (object.layerId) {
      const layer = this.getLayerById(object.layerId);
      if (layer) {
        layer.removeObject(object);
      }
    }
  }

  addLayer(name = `Layer ${this.layers.length + 1}`, options = {}) {
    const layer = new FabricLayer(name, options);
    this.layers.push(layer);
    
    // Set as active layer if it's the first non-background layer
    if (this.layers.length === 2) {
      this.activeLayerIndex = 1;
    }
    
    this.updateUI();
    this.canvas.emit('layerAdded', { layer, index: this.layers.length - 1 });
    
    return layer;
  }

  removeLayer(index) {
    if (index < 0 || index >= this.layers.length) return false;
    if (this.layers.length <= 1) return false; // Keep at least one layer
    
    const layer = this.layers[index];
    
    // Remove all objects from this layer from the canvas
    layer.objects.forEach(obj => {
      this.fabricCanvas.remove(obj);
    });
    
    this.layers.splice(index, 1);
    
    // Adjust active layer index
    if (this.activeLayerIndex >= index) {
      this.activeLayerIndex = Math.max(0, this.activeLayerIndex - 1);
    }
    
    this.updateUI();
    this.canvas.emit('layerRemoved', { layer, index });
    
    return true;
  }

  getLayer(index) {
    return this.layers[index];
  }

  getLayerById(id) {
    return this.layers.find(layer => layer.id === id);
  }

  getActiveLayer() {
    return this.layers[this.activeLayerIndex];
  }

  setActiveLayer(index) {
    if (index >= 0 && index < this.layers.length) {
      this.activeLayerIndex = index;
      this.updateUI();
      this.canvas.emit('activeLayerChanged', { layer: this.getActiveLayer(), index });
    }
  }

  setLayerVisibility(index, visible) {
    const layer = this.getLayer(index);
    if (!layer) return;
    
    layer.setVisibility(visible);
    this.fabricCanvas.renderAll();
    this.updateUI();
    this.canvas.emit('layerChanged', { layer, index });
  }

  setLayerLocked(index, locked) {
    const layer = this.getLayer(index);
    if (!layer) return;
    
    layer.setLocked(locked);
    this.fabricCanvas.renderAll();
    this.updateUI();
    this.canvas.emit('layerChanged', { layer, index });
  }

  moveLayer(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.layers.length) return false;
    if (toIndex < 0 || toIndex >= this.layers.length) return false;
    if (fromIndex === toIndex) return false;
    
    const layer = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, layer);
    
    // Adjust active layer index
    if (this.activeLayerIndex === fromIndex) {
      this.activeLayerIndex = toIndex;
    } else if (fromIndex < this.activeLayerIndex && toIndex >= this.activeLayerIndex) {
      this.activeLayerIndex--;
    } else if (fromIndex > this.activeLayerIndex && toIndex <= this.activeLayerIndex) {
      this.activeLayerIndex++;
    }
    
    this.updateUI();
    this.canvas.emit('layerMoved', { layer, fromIndex, toIndex });
    
    return true;
  }

  duplicateLayer(index) {
    const layer = this.getLayer(index);
    if (!layer) return null;
    
    const newLayer = this.addLayer(`${layer.name} Copy`);
    
    // Clone objects from original layer
    layer.objects.forEach(obj => {
      obj.clone((clonedObj) => {
        this.fabricCanvas.add(clonedObj);
        newLayer.addObject(clonedObj);
      });
    });
    
    newLayer.visible = layer.visible;
    newLayer.locked = layer.locked;
    
    this.fabricCanvas.renderAll();
    return newLayer;
  }

  // Move active layer to front (top)
  bringToFront() {
    const activeIndex = this.activeLayerIndex;
    if (activeIndex < this.layers.length - 1) {
      return this.moveLayer(activeIndex, this.layers.length - 1);
    }
    return false;
  }

  // Move active layer forward (up one position)
  bringForward() {
    const activeIndex = this.activeLayerIndex;
    if (activeIndex < this.layers.length - 1) {
      return this.moveLayer(activeIndex, activeIndex + 1);
    }
    return false;
  }

  // Move active layer backward (down one position)
  sendBackward() {
    const activeIndex = this.activeLayerIndex;
    if (activeIndex > 0) {
      return this.moveLayer(activeIndex, activeIndex - 1);
    }
    return false;
  }

  // Move active layer to back (bottom)
  sendToBack() {
    const activeIndex = this.activeLayerIndex;
    if (activeIndex > 0) {
      return this.moveLayer(activeIndex, 0);
    }
    return false;
  }

  updateUI() {
    const layersPanel = document.getElementById('layers-panel');
    if (!layersPanel) return;
    
    layersPanel.innerHTML = '';
    
    // Render layers in reverse order (top to bottom)
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const layerElement = this.createLayerElement(layer, i);
      layersPanel.appendChild(layerElement);
    }
  }

  createLayerElement(layer, index) {
    const layerDiv = document.createElement('div');
    layerDiv.className = `layer ${index === this.activeLayerIndex ? 'active' : ''}`;
    layerDiv.dataset.layer = index;
    
    layerDiv.innerHTML = `
      <span class="layer-name">${layer.name}</span>
      <div class="layer-controls">
        <button class="layer-btn ${layer.visible ? '' : 'disabled'}" 
                title="Toggle Visibility" 
                data-action="toggle-visibility">👁️</button>
        <button class="layer-btn ${layer.locked ? 'active' : ''}" 
                title="Lock Layer" 
                data-action="toggle-lock">🔒</button>
      </div>
    `;
    
    // Add event listeners
    layerDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('layer-btn')) {
        this.handleLayerAction(e.target.dataset.action, index);
      } else {
        this.setActiveLayer(index);
      }
    });
    
    return layerDiv;
  }

  handleLayerAction(action, index) {
    const layer = this.getLayer(index);
    if (!layer) return;
    
    switch (action) {
      case 'toggle-visibility':
        this.setLayerVisibility(index, !layer.visible);
        break;
      case 'toggle-lock':
        this.setLayerLocked(index, !layer.locked);
        break;
    }
  }

  clear() {
    this.layers.forEach(layer => {
      layer.clear();
    });
    this.fabricCanvas.clear();
  }

  exportLayers() {
    return this.layers.map(layer => ({
      name: layer.name,
      visible: layer.visible,
      locked: layer.locked,
      isBackground: layer.isBackground,
      objectCount: layer.objects.length
    }));
  }
} 