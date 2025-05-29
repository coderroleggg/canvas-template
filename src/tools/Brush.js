import * as fabric from 'fabric';

export class Brush {
  constructor(options = {}) {
    this.options = {
      size: 5,
      color: '#000000',
      opacity: 1.0,
      type: 'pencil', // pencil, spray, eraser
      ...options
    };
    
    this.canvas = null;
    this.isActive = false;
  }

  activate(canvas) {
    this.canvas = canvas;
    this.isActive = true;
    
    // Create the appropriate Fabric.js brush
    this.createBrush();
    
    // Enable drawing mode
    canvas.enableDrawingMode(this.brush);
    
    // Apply current settings
    this.updateBrush();
  }

  deactivate() {
    if (this.canvas) {
      this.canvas.disableDrawingMode();
    }
    
    this.isActive = false;
    this.canvas = null;
  }

  createBrush() {
    if (!this.canvas || !this.canvas.canvas) {
      console.error('Canvas not available for brush creation');
      return;
    }

    switch (this.options.type) {
      case 'spray':
        this.brush = new fabric.SprayBrush(this.canvas.canvas);
        break;
      case 'eraser':
        // Use PencilBrush for eraser and handle composite operation
        this.brush = new fabric.PencilBrush(this.canvas.canvas);
        // Set white color for eraser to work with globalCompositeOperation
        this.brush.color = 'white';
        // Store that this is an eraser type
        this.brush._isEraser = true;
        break;
      case 'pencil':
      default:
        this.brush = new fabric.PencilBrush(this.canvas.canvas);
        break;
    }
  }

  updateBrush() {
    if (!this.brush) return;
    
    this.brush.width = this.options.size;
    
    // For eraser, ensure it stays white
    if (this.options.type === 'eraser') {
      this.brush.color = 'white';
      this.brush._isEraser = true;
      return;
    }
    
    this.brush.color = this.options.color;
    
    // Apply opacity to color if it's not an eraser
    if (this.options.opacity < 1.0) {
      try {
        const color = new fabric.Color(this.options.color);
        color.setAlpha(this.options.opacity);
        this.brush.color = color.toRgba();
      } catch (error) {
        console.warn('Failed to apply opacity to brush color:', error);
        this.brush.color = this.options.color;
      }
    }
  }

  setSize(size) {
    this.options.size = size;
    if (this.brush) {
      this.brush.width = size;
    }
  }

  setColor(color) {
    this.options.color = color;
    this.updateBrush();
  }

  setOpacity(opacity) {
    this.options.opacity = opacity;
    this.updateBrush();
  }

  setType(type) {
    this.options.type = type;
    if (this.isActive && this.canvas) {
      // Recreate brush with new type
      this.createBrush();
      if (this.brush && this.canvas.canvas) {
        this.canvas.canvas.freeDrawingBrush = this.brush;
        this.updateBrush();
      }
    }
  }

  getSize() {
    return this.options.size;
  }

  getColor() {
    return this.options.color;
  }

  getOpacity() {
    return this.options.opacity;
  }

  getType() {
    return this.options.type;
  }
} 