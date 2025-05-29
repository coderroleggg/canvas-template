import * as fabric from 'fabric';

export class TextTool {
  constructor(options = {}) {
    this.options = {
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      opacity: 1.0,
      ...options
    };
    
    this.canvas = null;
    this.isActive = false;
  }

  activate(canvas) {
    this.canvas = canvas;
    this.isActive = true;
    
    // Disable drawing mode
    canvas.disableDrawingMode();
    canvas.canvas.selection = false;
    canvas.canvas.defaultCursor = 'text';
    
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
  }

  unbindEvents() {
    if (!this.canvas || !this.canvas.canvas) return;
    
    this.canvas.canvas.off('mouse:down', this.onMouseDown.bind(this));
  }

  onMouseDown(event) {
    if (!this.canvas || !this.canvas.canvas) {
      console.error('Canvas not available for text creation');
      return;
    }
    
    const pointer = this.canvas.canvas.getPointer(event.e);
    this.createText(pointer.x, pointer.y);
  }

  createText(x, y, text = 'Type here...') {
    const textObject = new fabric.IText(text, {
      left: x,
      top: y,
      fontSize: this.options.fontSize,
      fontFamily: this.options.fontFamily,
      fill: this.options.fill,
      fontWeight: this.options.fontWeight,
      fontStyle: this.options.fontStyle,
      textAlign: this.options.textAlign,
      opacity: this.options.opacity,
      selectable: true,
      evented: true,
      editable: true
    });

    this.canvas.canvas.add(textObject);
    this.canvas.canvas.setActiveObject(textObject);
    
    // Enter editing mode immediately
    textObject.enterEditing();
    textObject.selectAll();
    
    this.canvas.canvas.renderAll();
    
    return textObject;
  }

  // Configuration methods
  setFontSize(size) {
    this.options.fontSize = size;
    this.updateSelectedText({ fontSize: size });
  }

  setFontFamily(family) {
    this.options.fontFamily = family;
    this.updateSelectedText({ fontFamily: family });
  }

  setFill(color) {
    this.options.fill = color;
    this.updateSelectedText({ fill: color });
  }

  setFontWeight(weight) {
    this.options.fontWeight = weight;
    this.updateSelectedText({ fontWeight: weight });
  }

  setFontStyle(style) {
    this.options.fontStyle = style;
    this.updateSelectedText({ fontStyle: style });
  }

  setTextAlign(align) {
    this.options.textAlign = align;
    this.updateSelectedText({ textAlign: align });
  }

  setOpacity(opacity) {
    this.options.opacity = opacity;
    this.updateSelectedText({ opacity: opacity });
  }

  updateSelectedText(properties) {
    if (!this.canvas || !this.canvas.canvas) return;
    
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      activeObject.set(properties);
      this.canvas.canvas.renderAll();
    }
  }

  // Text formatting methods
  makeBold() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      const currentWeight = activeObject.fontWeight;
      const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
      activeObject.set('fontWeight', newWeight);
      this.canvas.canvas.renderAll();
    }
  }

  makeItalic() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'textbox')) {
      const currentStyle = activeObject.fontStyle;
      const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
      activeObject.set('fontStyle', newStyle);
      this.canvas.canvas.renderAll();
    }
  }

  alignLeft() {
    this.updateSelectedText({ textAlign: 'left' });
  }

  alignCenter() {
    this.updateSelectedText({ textAlign: 'center' });
  }

  alignRight() {
    this.updateSelectedText({ textAlign: 'right' });
  }

  // Getters
  getFontSize() {
    return this.options.fontSize;
  }

  getFontFamily() {
    return this.options.fontFamily;
  }

  getFill() {
    return this.options.fill;
  }

  getFontWeight() {
    return this.options.fontWeight;
  }

  getFontStyle() {
    return this.options.fontStyle;
  }

  getTextAlign() {
    return this.options.textAlign;
  }

  getOpacity() {
    return this.options.opacity;
  }
} 