export class Layer {
  constructor(name, options = {}) {
    this.name = name;
    this.visible = options.visible !== false;
    this.opacity = options.opacity || 1.0;
    this.blendMode = options.blendMode || 'source-over';
    this.locked = options.locked || false;
    this.isBackground = options.isBackground || false;
    
    // Create offscreen canvas for this layer
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.width || 800;
    this.canvas.height = options.height || 600;
    
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });
    
    // Set initial canvas properties
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    
    // Initialize background layer with white background
    if (this.isBackground) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Re-fill background layer
    if (this.isBackground) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resize(width, height) {
    // Create temporary canvas to preserve content
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Resize main canvas
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Restore content
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    // Re-apply canvas properties
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  setBlendMode(blendMode) {
    const validBlendModes = [
      'source-over', 'source-in', 'source-out', 'source-atop',
      'destination-over', 'destination-in', 'destination-out', 'destination-atop',
      'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay',
      'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
      'soft-light', 'difference', 'exclusion', 'hue', 'saturation',
      'color', 'luminosity'
    ];
    
    if (validBlendModes.includes(blendMode)) {
      this.blendMode = blendMode;
    }
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isVisible() {
    return this.visible;
  }

  isLocked() {
    return this.locked;
  }

  // Drawing methods that work on this layer's context
  drawLine(x1, y1, x2, y2, style = {}) {
    if (this.locked) return;
    
    this.ctx.save();
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  drawRect(x, y, width, height, style = {}) {
    if (this.locked) return;
    
    this.ctx.save();
    this.applyStyle(style);
    
    if (style.fill !== false) {
      this.ctx.fillRect(x, y, width, height);
    }
    
    if (style.stroke !== false) {
      this.ctx.strokeRect(x, y, width, height);
    }
    
    this.ctx.restore();
  }

  drawCircle(x, y, radius, style = {}) {
    if (this.locked) return;
    
    this.ctx.save();
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (style.fill !== false) {
      this.ctx.fill();
    }
    
    if (style.stroke !== false) {
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawPath(points, style = {}) {
    if (this.locked || points.length < 2) return;
    
    this.ctx.save();
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (style.closePath) {
      this.ctx.closePath();
    }
    
    if (style.fill !== false && style.closePath) {
      this.ctx.fill();
    }
    
    if (style.stroke !== false) {
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawSmoothPath(points, style = {}) {
    if (this.locked || points.length < 2) return;
    
    this.ctx.save();
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // Last segment
    if (points.length > 2) {
      this.ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  applyStyle(style) {
    if (style.strokeStyle) {
      this.ctx.strokeStyle = style.strokeStyle;
    }
    
    if (style.fillStyle) {
      this.ctx.fillStyle = style.fillStyle;
    }
    
    if (style.lineWidth !== undefined) {
      this.ctx.lineWidth = style.lineWidth;
    }
    
    if (style.lineCap) {
      this.ctx.lineCap = style.lineCap;
    }
    
    if (style.lineJoin) {
      this.ctx.lineJoin = style.lineJoin;
    }
    
    if (style.globalAlpha !== undefined) {
      this.ctx.globalAlpha = style.globalAlpha;
    }
    
    if (style.globalCompositeOperation) {
      this.ctx.globalCompositeOperation = style.globalCompositeOperation;
    }
  }

  // Get layer data for export/import
  toDataURL(format = 'image/png', quality = 1.0) {
    return this.canvas.toDataURL(format, quality);
  }

  toBlob(format = 'image/png', quality = 1.0) {
    return new Promise(resolve => {
      this.canvas.toBlob(resolve, format, quality);
    });
  }

  // Load image data into layer
  loadImage(imageSource) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.clear();
        this.ctx.drawImage(img, 0, 0);
        resolve();
      };
      
      img.onerror = reject;
      
      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof HTMLImageElement) {
        img.src = imageSource.src;
      } else if (imageSource instanceof HTMLCanvasElement) {
        this.clear();
        this.ctx.drawImage(imageSource, 0, 0);
        resolve();
      } else {
        reject(new Error('Invalid image source'));
      }
    });
  }

  destroy() {
    // Clean up canvas
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.canvas = null;
    this.ctx = null;
  }
} 