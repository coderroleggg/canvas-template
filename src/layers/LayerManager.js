import { Layer } from './Layer.js';

export class LayerManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.layers = [];
    this.activeLayerIndex = 0;
    
    // Create default background layer
    this.addLayer('Background', { isBackground: true });
  }

  addLayer(name = `Layer ${this.layers.length + 1}`, options = {}) {
    const layer = new Layer(name, {
      width: this.canvas.width,
      height: this.canvas.height,
      ...options
    });
    
    this.layers.push(layer);
    
    // Set as active layer if it's the first non-background layer
    if (this.layers.length === 2) {
      this.activeLayerIndex = 1;
    }
    
    this.canvas.emit('layerAdded', { layer, index: this.layers.length - 1 });
    this.updateLayersUI();
    
    return layer;
  }

  removeLayer(index) {
    if (index < 0 || index >= this.layers.length) return false;
    if (this.layers.length <= 1) return false; // Keep at least one layer
    
    const layer = this.layers[index];
    this.layers.splice(index, 1);
    
    // Adjust active layer index
    if (this.activeLayerIndex >= index) {
      this.activeLayerIndex = Math.max(0, this.activeLayerIndex - 1);
    }
    
    layer.destroy();
    
    this.canvas.emit('layerRemoved', { layer, index });
    this.updateLayersUI();
    
    return true;
  }

  getLayer(index) {
    return this.layers[index];
  }

  getActiveLayer() {
    return this.layers[this.activeLayerIndex];
  }

  setActiveLayer(index) {
    if (index >= 0 && index < this.layers.length) {
      this.activeLayerIndex = index;
      this.canvas.emit('activeLayerChanged', { layer: this.getActiveLayer(), index });
      this.updateLayersUI();
    }
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
    
    this.canvas.emit('layerMoved', { layer, fromIndex, toIndex });
    this.updateLayersUI();
    
    return true;
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

  duplicateLayer(index) {
    const layer = this.getLayer(index);
    if (!layer) return null;
    
    const newLayer = this.addLayer(`${layer.name} Copy`);
    
    // Copy layer content
    newLayer.ctx.drawImage(layer.canvas, 0, 0);
    newLayer.visible = layer.visible;
    newLayer.opacity = layer.opacity;
    newLayer.blendMode = layer.blendMode;
    
    return newLayer;
  }

  mergeDown(index) {
    if (index <= 0 || index >= this.layers.length) return false;
    
    const upperLayer = this.layers[index];
    const lowerLayer = this.layers[index - 1];
    
    // Save current composite operation
    const prevComposite = lowerLayer.ctx.globalCompositeOperation;
    const prevAlpha = lowerLayer.ctx.globalAlpha;
    
    // Apply blend mode and opacity
    lowerLayer.ctx.globalCompositeOperation = upperLayer.blendMode;
    lowerLayer.ctx.globalAlpha = upperLayer.opacity;
    
    // Draw upper layer onto lower layer
    lowerLayer.ctx.drawImage(upperLayer.canvas, 0, 0);
    
    // Restore composite operation
    lowerLayer.ctx.globalCompositeOperation = prevComposite;
    lowerLayer.ctx.globalAlpha = prevAlpha;
    
    // Remove upper layer
    this.removeLayer(index);
    
    return true;
  }

  render() {
    const ctx = this.canvas.ctx;
    
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      
      if (!layer.visible) continue;
      
      // Save context state
      ctx.save();
      
      // Apply layer properties
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;
      
      // Draw layer
      ctx.drawImage(layer.canvas, 0, 0);
      
      // Restore context state
      ctx.restore();
    }
  }

  clear() {
    for (const layer of this.layers) {
      layer.clear();
    }
  }

  resize(width, height) {
    for (const layer of this.layers) {
      layer.resize(width, height);
    }
  }

  updateLayersUI() {
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
        layer.visible = !layer.visible;
        break;
      case 'toggle-lock':
        layer.locked = !layer.locked;
        break;
    }
    
    this.updateLayersUI();
    this.canvas.emit('layerChanged', { layer, index });
  }

  exportLayers() {
    return this.layers.map(layer => ({
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      locked: layer.locked,
      data: layer.canvas.toDataURL()
    }));
  }

  importLayers(layersData) {
    // Clear existing layers except background
    while (this.layers.length > 1) {
      this.removeLayer(this.layers.length - 1);
    }
    
    // Import layers
    layersData.forEach((layerData, index) => {
      if (index === 0) {
        // Update background layer
        const layer = this.layers[0];
        layer.name = layerData.name;
        layer.visible = layerData.visible;
        layer.opacity = layerData.opacity;
        layer.blendMode = layerData.blendMode;
        layer.locked = layerData.locked;
        
        // Load image data
        const img = new Image();
        img.onload = () => {
          layer.clear();
          layer.ctx.drawImage(img, 0, 0);
        };
        img.src = layerData.data;
      } else {
        // Create new layer
        const layer = this.addLayer(layerData.name);
        layer.visible = layerData.visible;
        layer.opacity = layerData.opacity;
        layer.blendMode = layerData.blendMode;
        layer.locked = layerData.locked;
        
        // Load image data
        const img = new Image();
        img.onload = () => {
          layer.clear();
          layer.ctx.drawImage(img, 0, 0);
        };
        img.src = layerData.data;
      }
    });
    
    this.updateLayersUI();
  }
} 