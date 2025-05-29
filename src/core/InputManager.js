export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.element = canvas.canvas;
    
    this.mouse = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      isDown: false,
      button: -1
    };
    
    this.keyboard = {
      keys: new Set(),
      modifiers: {
        shift: false,
        ctrl: false,
        alt: false,
        meta: false
      }
    };
    
    this.touch = {
      touches: new Map(),
      isActive: false
    };
    
    this.bindEvents();
  }

  bindEvents() {
    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('wheel', this.handleWheel.bind(this));
    this.element.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    
    // Keyboard events (on document)
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behaviors
    this.element.addEventListener('dragstart', e => e.preventDefault());
    this.element.addEventListener('selectstart', e => e.preventDefault());
  }

  getCanvasPosition(clientX, clientY) {
    const rect = this.element.getBoundingClientRect();
    
    // Debug logging
    console.log('Debug coords:', {
      clientX, clientY,
      rectLeft: rect.left, rectTop: rect.top,
      rectWidth: rect.width, rectHeight: rect.height,
      canvasWidth: this.canvas.width, canvasHeight: this.canvas.height,
      elementWidth: this.element.width, elementHeight: this.element.height
    });
    
    return {
      x: (clientX - rect.left) * this.canvas.width / rect.width,
      y: (clientY - rect.top) * this.canvas.height / rect.height
    };
  }

  updateMousePosition(clientX, clientY) {
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
    
    const pos = this.getCanvasPosition(clientX, clientY);
    this.mouse.x = pos.x;
    this.mouse.y = pos.y;
  }

  updateModifiers(event) {
    this.keyboard.modifiers.shift = event.shiftKey;
    this.keyboard.modifiers.ctrl = event.ctrlKey;
    this.keyboard.modifiers.alt = event.altKey;
    this.keyboard.modifiers.meta = event.metaKey;
  }

  // Mouse event handlers
  handleMouseDown(event) {
    event.preventDefault();
    
    this.updateMousePosition(event.clientX, event.clientY);
    this.updateModifiers(event);
    
    this.mouse.isDown = true;
    this.mouse.button = event.button;
    
    const inputEvent = {
      type: 'mousedown',
      x: this.mouse.x,
      y: this.mouse.y,
      button: event.button,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onMouseDown) {
      this.canvas.currentTool.onMouseDown(inputEvent);
    }
  }

  handleMouseMove(event) {
    this.updateMousePosition(event.clientX, event.clientY);
    this.updateModifiers(event);
    
    const inputEvent = {
      type: 'mousemove',
      x: this.mouse.x,
      y: this.mouse.y,
      prevX: this.mouse.prevX,
      prevY: this.mouse.prevY,
      isDown: this.mouse.isDown,
      button: this.mouse.button,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool) {
      if (this.mouse.isDown && this.canvas.currentTool.onMouseDrag) {
        this.canvas.currentTool.onMouseDrag(inputEvent);
      } else if (this.canvas.currentTool.onMouseMove) {
        this.canvas.currentTool.onMouseMove(inputEvent);
      }
    }
    
    // Update cursor position in UI
    this.updateCursorPosition();
  }

  handleMouseUp(event) {
    this.updateMousePosition(event.clientX, event.clientY);
    this.updateModifiers(event);
    
    this.mouse.isDown = false;
    
    const inputEvent = {
      type: 'mouseup',
      x: this.mouse.x,
      y: this.mouse.y,
      button: event.button,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onMouseUp) {
      this.canvas.currentTool.onMouseUp(inputEvent);
    }
  }

  handleWheel(event) {
    event.preventDefault();
    
    this.updateMousePosition(event.clientX, event.clientY);
    this.updateModifiers(event);
    
    const inputEvent = {
      type: 'wheel',
      x: this.mouse.x,
      y: this.mouse.y,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onWheel) {
      this.canvas.currentTool.onWheel(inputEvent);
    }
  }

  handleContextMenu(event) {
    event.preventDefault();
  }

  // Touch event handlers
  handleTouchStart(event) {
    event.preventDefault();
    
    this.touch.isActive = true;
    
    for (const touch of event.changedTouches) {
      const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
      this.touch.touches.set(touch.identifier, {
        id: touch.identifier,
        x: pos.x,
        y: pos.y,
        prevX: pos.x,
        prevY: pos.y
      });
    }
    
    const inputEvent = {
      type: 'touchstart',
      touches: Array.from(this.touch.touches.values()),
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onTouchStart) {
      this.canvas.currentTool.onTouchStart(inputEvent);
    }
  }

  handleTouchMove(event) {
    event.preventDefault();
    
    for (const touch of event.changedTouches) {
      const touchData = this.touch.touches.get(touch.identifier);
      if (touchData) {
        touchData.prevX = touchData.x;
        touchData.prevY = touchData.y;
        
        const pos = this.getCanvasPosition(touch.clientX, touch.clientY);
        touchData.x = pos.x;
        touchData.y = pos.y;
      }
    }
    
    const inputEvent = {
      type: 'touchmove',
      touches: Array.from(this.touch.touches.values()),
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onTouchMove) {
      this.canvas.currentTool.onTouchMove(inputEvent);
    }
  }

  handleTouchEnd(event) {
    event.preventDefault();
    
    for (const touch of event.changedTouches) {
      this.touch.touches.delete(touch.identifier);
    }
    
    if (this.touch.touches.size === 0) {
      this.touch.isActive = false;
    }
    
    const inputEvent = {
      type: 'touchend',
      touches: Array.from(this.touch.touches.values()),
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onTouchEnd) {
      this.canvas.currentTool.onTouchEnd(inputEvent);
    }
  }

  handleTouchCancel(event) {
    this.handleTouchEnd(event);
  }

  // Keyboard event handlers
  handleKeyDown(event) {
    this.keyboard.keys.add(event.code);
    this.updateModifiers(event);
    
    const inputEvent = {
      type: 'keydown',
      code: event.code,
      key: event.key,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onKeyDown) {
      this.canvas.currentTool.onKeyDown(inputEvent);
    }
  }

  handleKeyUp(event) {
    this.keyboard.keys.delete(event.code);
    this.updateModifiers(event);
    
    const inputEvent = {
      type: 'keyup',
      code: event.code,
      key: event.key,
      modifiers: { ...this.keyboard.modifiers },
      originalEvent: event
    };
    
    this.canvas.emit('input', inputEvent);
    
    if (this.canvas.currentTool && this.canvas.currentTool.onKeyUp) {
      this.canvas.currentTool.onKeyUp(inputEvent);
    }
  }

  updateCursorPosition() {
    const positionElement = document.getElementById('cursor-position');
    if (positionElement) {
      positionElement.textContent = `Position: (${Math.round(this.mouse.x)}, ${Math.round(this.mouse.y)})`;
    }
  }

  isKeyPressed(code) {
    return this.keyboard.keys.has(code);
  }

  destroy() {
    // Remove all event listeners
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('wheel', this.handleWheel);
    this.element.removeEventListener('contextmenu', this.handleContextMenu);
    
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
} 