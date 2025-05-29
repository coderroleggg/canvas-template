export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.ctx;
    
    this.renderQueue = [];
    this.isRendering = false;
  }

  render() {
    if (this.isRendering) return;
    
    this.isRendering = true;
    
    // Clear canvas
    this.clear();
    
    // Render layers
    if (this.canvas.layers) {
      this.canvas.layers.render();
    }
    
    // Process render queue
    this.processRenderQueue();
    
    // Emit render event
    this.canvas.emit('render');
    
    this.isRendering = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fill with background color if specified
    if (this.canvas.options.backgroundColor) {
      this.ctx.fillStyle = this.canvas.options.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  addToRenderQueue(renderFunction) {
    this.renderQueue.push(renderFunction);
  }

  processRenderQueue() {
    while (this.renderQueue.length > 0) {
      const renderFunction = this.renderQueue.shift();
      try {
        renderFunction(this.ctx);
      } catch (error) {
        console.error('Error in render function:', error);
      }
    }
  }

  // Drawing utilities
  drawLine(x1, y1, x2, y2, style = {}) {
    this.ctx.save();
    
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  drawRect(x, y, width, height, style = {}) {
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

  drawEllipse(x, y, radiusX, radiusY, style = {}) {
    this.ctx.save();
    
    this.applyStyle(style);
    
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    
    if (style.fill !== false) {
      this.ctx.fill();
    }
    
    if (style.stroke !== false) {
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawText(text, x, y, style = {}) {
    this.ctx.save();
    
    this.applyStyle(style);
    
    if (style.font) {
      this.ctx.font = style.font;
    }
    
    if (style.textAlign) {
      this.ctx.textAlign = style.textAlign;
    }
    
    if (style.textBaseline) {
      this.ctx.textBaseline = style.textBaseline;
    }
    
    if (style.fill !== false) {
      this.ctx.fillText(text, x, y);
    }
    
    if (style.stroke !== false) {
      this.ctx.strokeText(text, x, y);
    }
    
    this.ctx.restore();
  }

  drawPath(points, style = {}) {
    if (points.length < 2) return;
    
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
    if (points.length < 2) return;
    
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
    
    if (style.shadowColor) {
      this.ctx.shadowColor = style.shadowColor;
    }
    
    if (style.shadowBlur !== undefined) {
      this.ctx.shadowBlur = style.shadowBlur;
    }
    
    if (style.shadowOffsetX !== undefined) {
      this.ctx.shadowOffsetX = style.shadowOffsetX;
    }
    
    if (style.shadowOffsetY !== undefined) {
      this.ctx.shadowOffsetY = style.shadowOffsetY;
    }
  }

  // Utility methods
  saveState() {
    this.ctx.save();
  }

  restoreState() {
    this.ctx.restore();
  }

  setTransform(a, b, c, d, e, f) {
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  translate(x, y) {
    this.ctx.translate(x, y);
  }

  rotate(angle) {
    this.ctx.rotate(angle);
  }

  scale(x, y) {
    this.ctx.scale(x, y);
  }

  clip(path) {
    if (path) {
      this.ctx.clip(path);
    } else {
      this.ctx.clip();
    }
  }
} 