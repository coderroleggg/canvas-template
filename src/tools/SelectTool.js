import * as fabric from 'fabric';

export class SelectTool {
  constructor(options = {}) {
    this.options = {
      ...options
    };
    
    this.canvas = null;
    this.isActive = false;
  }

  activate(canvas) {
    this.canvas = canvas;
    this.isActive = true;
    
    // Disable drawing mode and enable selection
    canvas.disableDrawingMode();
    canvas.canvas.selection = true;
    canvas.canvas.defaultCursor = 'default';
    canvas.canvas.hoverCursor = 'move';
    canvas.canvas.moveCursor = 'move';
  }

  deactivate() {
    this.isActive = false;
    this.canvas = null;
  }

  // Selection methods
  selectAll() {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    if (objects.length > 0) {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: this.canvas.canvas
      });
      this.canvas.canvas.setActiveObject(selection);
      this.canvas.canvas.renderAll();
    }
  }

  deselectAll() {
    if (!this.canvas) return;
    
    this.canvas.canvas.discardActiveObject();
    this.canvas.canvas.renderAll();
  }

  deleteSelected() {
    if (!this.canvas) return;
    
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        // Multiple objects selected
        activeObject.forEachObject((obj) => {
          this.canvas.removeObject(obj);
        });
      } else {
        // Single object selected
        this.canvas.removeObject(activeObject);
      }
      this.canvas.canvas.discardActiveObject();
      this.canvas.canvas.renderAll();
    }
  }

  duplicateSelected() {
    if (!this.canvas) return;
    
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        cloned.set({
          left: cloned.left + 10,
          top: cloned.top + 10,
        });
        if (cloned.type === 'activeSelection') {
          cloned.canvas = this.canvas.canvas;
          cloned.forEachObject((obj) => {
            this.canvas.canvas.add(obj);
          });
          cloned.setCoords();
        } else {
          this.canvas.canvas.add(cloned);
        }
        this.canvas.canvas.setActiveObject(cloned);
        this.canvas.canvas.renderAll();
      });
    }
  }

  groupSelected() {
    if (!this.canvas) return;
    
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'activeSelection') {
      const group = activeObject.toGroup();
      this.canvas.canvas.renderAll();
    }
  }

  ungroupSelected() {
    if (!this.canvas) return;
    
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'group') {
      activeObject.toActiveSelection();
      this.canvas.canvas.renderAll();
    }
  }
} 