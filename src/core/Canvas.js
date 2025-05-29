import * as fabric from 'fabric';
import { EventEmitter } from '../utils/EventEmitter.js';

export class Canvas extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      container: '#canvas-container',
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      ...options
    };

    this.isInitialized = false;
    this.isRunning = false;
    this.currentTool = null;
    this.plugins = new Map();
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    
    this.isInitialized = true;
    this.emit('initialized');
  }

  createCanvas() {
    // Get container
    const container = typeof this.options.container === 'string' 
      ? document.querySelector(this.options.container)
      : this.options.container;

    if (!container) {
      throw new Error('Canvas container not found');
    }

    // Create or get canvas element
    this.canvasElement = container.querySelector('canvas') || document.createElement('canvas');
    this.canvasElement.id = this.canvasElement.id || 'main-canvas';
    
    if (!this.canvasElement.parentNode) {
      container.appendChild(this.canvasElement);
    }

    try {
      // Initialize Fabric.js canvas
      this.canvas = new fabric.Canvas(this.canvasElement, {
        width: this.options.width,
        height: this.options.height,
        backgroundColor: this.options.backgroundColor,
        selection: false, // Disable group selection by default
        preserveObjectStacking: true
      });

      // Store dimensions
      this.width = this.options.width;
      this.height = this.options.height;
      
      console.log('✅ Fabric.js canvas initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Fabric.js canvas:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Forward Fabric.js events to our event system
    this.canvas.on('mouse:down', (e) => {
      this.emit('input', {
        type: 'mousedown',
        x: e.pointer.x,
        y: e.pointer.y,
        originalEvent: e.e
      });
    });

    this.canvas.on('mouse:move', (e) => {
      this.emit('input', {
        type: 'mousemove',
        x: e.pointer.x,
        y: e.pointer.y,
        originalEvent: e.e
      });
      
      // Update cursor position in UI
      this.updateCursorPosition(e.pointer.x, e.pointer.y);
    });

    this.canvas.on('mouse:up', (e) => {
      this.emit('input', {
        type: 'mouseup',
        x: e.pointer.x,
        y: e.pointer.y,
        originalEvent: e.e
      });
    });

    // Path created event for drawing tools
    this.canvas.on('path:created', (e) => {
      this.emit('pathCreated', e.path);
    });
  }

  updateCursorPosition(x, y) {
    const positionElement = document.getElementById('cursor-position');
    if (positionElement) {
      positionElement.textContent = `Position: (${Math.round(x)}, ${Math.round(y)})`;
    }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    
    this.canvas.setDimensions({
      width: width,
      height: height
    });

    this.emit('resize', { width, height });
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.emit('start');
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.emit('stop');
  }

  clear() {
    this.canvas.clear();
    this.canvas.backgroundColor = this.options.backgroundColor;
    this.canvas.renderAll();
  }

  setTool(tool) {
    try {
      if (this.currentTool) {
        this.currentTool.deactivate();
      }
      
      this.currentTool = tool;
      
      if (tool) {
        tool.activate(this);
      }
      
      this.emit('toolChanged', tool);
    } catch (error) {
      console.error('❌ Failed to set tool:', error);
      // Reset to null tool if activation fails
      this.currentTool = null;
    }
  }

  getTool() {
    return this.currentTool;
  }

  // Drawing mode methods
  enableDrawingMode(brush) {
    this.canvas.isDrawingMode = true;
    if (brush) {
      this.canvas.freeDrawingBrush = brush;
    }
    this.canvas.selection = false;
  }

  disableDrawingMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
  }

  // Brush configuration
  setBrushColor(color) {
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
  }

  setBrushWidth(width) {
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = width;
    }
  }

  setBrushOpacity(opacity) {
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = this.canvas.freeDrawingBrush.color.replace(/[\d\.]+\)$/g, opacity + ')');
    }
  }

  // Object manipulation
  addObject(object) {
    this.canvas.add(object);
    this.canvas.renderAll();
  }

  removeObject(object) {
    this.canvas.remove(object);
    this.canvas.renderAll();
  }

  getObjects() {
    return this.canvas.getObjects();
  }

  getActiveObject() {
    return this.canvas.getActiveObject();
  }

  // Layer-like functionality using Fabric.js objects
  bringToFront(object) {
    this.canvas.bringToFront(object);
    this.canvas.renderAll();
  }

  sendToBack(object) {
    this.canvas.sendToBack(object);
    this.canvas.renderAll();
  }

  // Export functionality
  exportImage(format = 'png', quality = 1.0) {
    return this.canvas.toDataURL({
      format: format,
      quality: quality,
      multiplier: 1
    });
  }

  exportBlob(format = 'png', quality = 1.0) {
    return new Promise(resolve => {
      this.canvas.toCanvasElement().toBlob(resolve, `image/${format}`, quality);
    });
  }

  exportSVG() {
    return this.canvas.toSVG();
  }

  exportJSON() {
    return this.canvas.toJSON();
  }

  loadFromJSON(json) {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(json, () => {
        this.canvas.renderAll();
        resolve();
      });
    });
  }

  // Plugin system
  registerPlugin(plugin) {
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    
    this.plugins.set(plugin.name, plugin);
    
    if (typeof plugin.init === 'function') {
      plugin.init(this);
    }
    
    this.emit('pluginRegistered', plugin);
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  // Zoom and pan
  setZoom(zoom) {
    this.canvas.setZoom(zoom);
    
    // Update zoom level in UI
    const zoomElement = document.getElementById('zoom-level');
    if (zoomElement) {
      zoomElement.textContent = `Zoom: ${Math.round(zoom * 100)}%`;
    }
  }

  getZoom() {
    return this.canvas.getZoom();
  }

  pan(x, y) {
    this.canvas.relativePan(new fabric.Point(x, y));
  }

  destroy() {
    this.stop();
    
    if (this.canvas) {
      this.canvas.dispose();
    }
    
    this.removeAllListeners();
    this.emit('destroyed');
  }
} 