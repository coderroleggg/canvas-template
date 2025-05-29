import * as fabric from 'fabric';

export class ShapeTool {
  constructor(options = {}) {
    this.options = {
      shapeType: 'rectangle', // rectangle, circle, line
      fill: '#ff0000',
      stroke: '#000000',
      strokeWidth: 2,
      opacity: 1.0,
      ...options
    };
    
    this.canvas = null;
    this.isActive = false;
    this.isDrawing = false;
    this.startPoint = null;
    this.currentShape = null;
  }

  activate(canvas) {
    this.canvas = canvas;
    this.isActive = true;
    
    // Disable drawing mode and selection
    canvas.disableDrawingMode();
    canvas.canvas.selection = false;
    canvas.canvas.defaultCursor = 'crosshair';
    
    // Bind events
    this.bindEvents();
  }

  deactivate() {
    this.unbindEvents();
    this.isActive = false;
    this.canvas = null;
  }

  bindEvents() {
    if (!this.canvas || !this.canvas.canvas) {
      console.error('Canvas not available for event binding');
      return;
    }
    
    this.canvas.canvas.on('mouse:down', this.onMouseDown.bind(this));
    this.canvas.canvas.on('mouse:move', this.onMouseMove.bind(this));
    this.canvas.canvas.on('mouse:up', this.onMouseUp.bind(this));
  }

  unbindEvents() {
    if (!this.canvas || !this.canvas.canvas) return;
    
    this.canvas.canvas.off('mouse:down', this.onMouseDown.bind(this));
    this.canvas.canvas.off('mouse:move', this.onMouseMove.bind(this));
    this.canvas.canvas.off('mouse:up', this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    if (!this.canvas || !this.canvas.canvas) {
      console.error('Canvas not available for shape creation');
      return;
    }
    
    this.isDrawing = true;
    this.startPoint = this.canvas.canvas.getPointer(event.e);
    
    // Create initial shape
    this.createShape();
  }

  onMouseMove(event) {
    if (!this.isDrawing || !this.currentShape || !this.canvas || !this.canvas.canvas) return;
    
    const pointer = this.canvas.canvas.getPointer(event.e);
    this.updateShape(pointer);
    this.canvas.canvas.renderAll();
  }

  onMouseUp(event) {
    if (!this.isDrawing || !this.canvas) return;
    
    this.isDrawing = false;
    
    // Finalize shape
    if (this.currentShape) {
      this.finalizeShape();
    }
    
    this.currentShape = null;
    this.startPoint = null;
  }

  createShape() {
    const { x, y } = this.startPoint;
    
    switch (this.options.shapeType) {
      case 'rectangle':
        this.currentShape = new fabric.Rect({
          left: x,
          top: y,
          width: 0,
          height: 0,
          fill: this.options.fill,
          stroke: this.options.stroke,
          strokeWidth: this.options.strokeWidth,
          opacity: this.options.opacity,
        });
        break;
        
      case 'circle':
        this.currentShape = new fabric.Circle({
          left: x,
          top: y,
          radius: 0,
          fill: this.options.fill,
          stroke: this.options.stroke,
          strokeWidth: this.options.strokeWidth,
          opacity: this.options.opacity,
        });
        break;
        
      case 'line':
        this.currentShape = new fabric.Line([x, y, x, y], {
          stroke: this.options.stroke,
          strokeWidth: this.options.strokeWidth,
          opacity: this.options.opacity,
        });
        break;
    }
    
    if (this.currentShape) {
      this.canvas.canvas.add(this.currentShape);
    }
  }

  updateShape(pointer) {
    if (!this.currentShape || !this.startPoint) return;
    
    const { x: startX, y: startY } = this.startPoint;
    const { x: currentX, y: currentY } = pointer;
    
    switch (this.options.shapeType) {
      case 'rectangle':
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        
        this.currentShape.set({
          left: left,
          top: top,
          width: width,
          height: height
        });
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
        ) / 2;
        
        this.currentShape.set({
          left: Math.min(startX, currentX),
          top: Math.min(startY, currentY),
          radius: radius
        });
        break;
        
      case 'line':
        this.currentShape.set({
          x2: currentX,
          y2: currentY
        });
        break;
    }
    
    this.currentShape.setCoords();
  }

  finalizeShape() {
    if (!this.currentShape) return;
    
    // Make the shape selectable
    this.currentShape.set({
      selectable: true,
      evented: true
    });
    
    this.canvas.canvas.setActiveObject(this.currentShape);
    this.canvas.canvas.renderAll();
  }

  // Configuration methods
  setShapeType(type) {
    this.options.shapeType = type;
  }

  setFill(color) {
    this.options.fill = color;
  }

  setStroke(color) {
    this.options.stroke = color;
  }

  setStrokeWidth(width) {
    this.options.strokeWidth = width;
  }

  setOpacity(opacity) {
    this.options.opacity = opacity;
  }

  getShapeType() {
    return this.options.shapeType;
  }

  getFill() {
    return this.options.fill;
  }

  getStroke() {
    return this.options.stroke;
  }

  getStrokeWidth() {
    return this.options.strokeWidth;
  }

  getOpacity() {
    return this.options.opacity;
  }
} 