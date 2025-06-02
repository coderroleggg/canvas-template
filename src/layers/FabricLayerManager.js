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

    // Listen for object selection events
    this.fabricCanvas.on('selection:created', (e) => {
      this.handleObjectSelected(e.selected[0]);
    });

    this.fabricCanvas.on('selection:updated', (e) => {
      this.handleObjectSelected(e.selected[0]);
    });
  }

  handleObjectSelected(object) {
    if (!object || !object.layerId) return;
    
    // Find which layer this object belongs to
    const layerIndex = this.layers.findIndex(layer => layer.id === object.layerId);
    if (layerIndex !== -1 && layerIndex !== this.activeLayerIndex) {
      this.setActiveLayer(layerIndex);
    }
  }

  handleObjectAdded(object) {
    // Add object to active layer if it doesn't belong to any layer
    if (!object.layerId) {
      const activeLayer = this.getActiveLayer();
      if (activeLayer) {
        activeLayer.addObject(object);
        // Ensure the object is positioned correctly according to layer order
        this.rearrangeCanvasObjects();
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
      
      // Update visual indicators for debugging
      this.updateLayerIndicators();
      
      this.canvas.emit('activeLayerChanged', { layer: this.getActiveLayer(), index });
    }
  }

  // Update visual indicators showing which layer each object belongs to
  updateLayerIndicators() {
    this.fabricCanvas.getObjects().forEach(obj => {
      // Remove any existing layer indicator
      if (obj.layerIndicator) {
        delete obj.layerIndicator;
      }
      
      // Find which layer this object belongs to
      const layerIndex = this.layers.findIndex(layer => layer.objects.includes(obj));
      if (layerIndex !== -1) {
        obj.layerIndicator = `Layer ${layerIndex + 1}: ${this.layers[layerIndex].name}`;
      }
    });
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
    
    // Rearrange objects on canvas according to new layer order
    this.rearrangeCanvasObjects();
    
    this.updateUI();
    this.canvas.emit('layerMoved', { layer, fromIndex, toIndex });
    
    return true;
  }

  // Rearrange all canvas objects according to layer order
  rearrangeCanvasObjects() {
    const allObjects = [];
    
    // Collect all objects in layer order (bottom to top)
    this.layers.forEach(layer => {
      layer.objects.forEach(obj => {
        allObjects.push(obj);
      });
    });
    
    // Clear canvas objects array without triggering events
    this.fabricCanvas._objects.length = 0;
    
    // Add objects back in the correct order
    allObjects.forEach(obj => {
      this.fabricCanvas._objects.push(obj);
    });
    
    // Trigger a complete re-render of the canvas
    this.fabricCanvas.requestRenderAll();
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
    const activeLayer = this.getActiveLayer();
    
    // If there's a selected object, move just that object
    const selectedObject = this.fabricCanvas.getActiveObject();
    if (selectedObject && activeLayer && activeLayer.objects.includes(selectedObject)) {
      // Move the object to the top of its layer
      const objIndex = activeLayer.objects.indexOf(selectedObject);
      activeLayer.objects.splice(objIndex, 1);
      activeLayer.objects.push(selectedObject);
      this.rearrangeCanvasObjects();
      return true;
    }
    
    // Otherwise, move the entire layer
    if (activeIndex < this.layers.length - 1) {
      return this.moveLayer(activeIndex, this.layers.length - 1);
    }
    return false;
  }

  // Move active layer forward (up one position)
  bringForward() {
    const activeIndex = this.activeLayerIndex;
    const activeLayer = this.getActiveLayer();
    
    // If there's a selected object, move just that object
    const selectedObject = this.fabricCanvas.getActiveObject();
    if (selectedObject && activeLayer && activeLayer.objects.includes(selectedObject)) {
      // Move the object up within its layer
      const objIndex = activeLayer.objects.indexOf(selectedObject);
      if (objIndex < activeLayer.objects.length - 1) {
        activeLayer.objects.splice(objIndex, 1);
        activeLayer.objects.splice(objIndex + 1, 0, selectedObject);
        this.rearrangeCanvasObjects();
        return true;
      }
    }
    
    // Otherwise, move the entire layer
    if (activeIndex < this.layers.length - 1) {
      return this.moveLayer(activeIndex, activeIndex + 1);
    }
    return false;
  }

  // Move active layer backward (down one position)
  sendBackward() {
    const activeIndex = this.activeLayerIndex;
    const activeLayer = this.getActiveLayer();
    
    // If there's a selected object, move just that object
    const selectedObject = this.fabricCanvas.getActiveObject();
    if (selectedObject && activeLayer && activeLayer.objects.includes(selectedObject)) {
      // Move the object down within its layer
      const objIndex = activeLayer.objects.indexOf(selectedObject);
      if (objIndex > 0) {
        activeLayer.objects.splice(objIndex, 1);
        activeLayer.objects.splice(objIndex - 1, 0, selectedObject);
        this.rearrangeCanvasObjects();
        return true;
      }
    }
    
    // Otherwise, move the entire layer
    if (activeIndex > 0) {
      return this.moveLayer(activeIndex, activeIndex - 1);
    }
    return false;
  }

  // Move active layer to back (bottom)
  sendToBack() {
    const activeIndex = this.activeLayerIndex;
    const activeLayer = this.getActiveLayer();
    
    // If there's a selected object, move just that object
    const selectedObject = this.fabricCanvas.getActiveObject();
    if (selectedObject && activeLayer && activeLayer.objects.includes(selectedObject)) {
      // Move the object to the bottom of its layer
      const objIndex = activeLayer.objects.indexOf(selectedObject);
      activeLayer.objects.splice(objIndex, 1);
      activeLayer.objects.unshift(selectedObject);
      this.rearrangeCanvasObjects();
      return true;
    }
    
    // Otherwise, move the entire layer
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