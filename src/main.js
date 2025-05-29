import { Canvas } from './core/Canvas.js';
import { Brush } from './tools/Brush.js';
import { SelectTool } from './tools/SelectTool.js';
import { ShapeTool } from './tools/ShapeTool.js';
import { TextTool } from './tools/TextTool.js';

class CanvasApp {
  constructor() {
    this.canvas = null;
    this.tools = new Map();
    this.currentTool = null;
    
    this.init();
  }

  async init() {
    try {
      // Show loading screen
      this.showLoading();
      
      // Initialize canvas
      this.canvas = new Canvas({
        container: '#canvas-container',
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      });
      
      // Register tools
      this.registerTools();
      
      // Set default tool
      this.selectTool('brush');
      
      // Setup UI event listeners
      this.setupUI();
      
      // Start canvas
      this.canvas.start();
      
      // Hide loading screen
      this.hideLoading();
      
      console.log('🎨 Canvas Template initialized successfully with Fabric.js!');
      
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      this.showError('Failed to initialize canvas application');
    }
  }

  registerTools() {
    // Register brush tool (with different types)
    const brush = new Brush({
      size: 5,
      color: '#000000',
      opacity: 1.0,
      type: 'pencil'
    });
    this.tools.set('brush', brush);

    // Register pen tool (same as brush but different default settings)
    const pen = new Brush({
      size: 2,
      color: '#000000',
      opacity: 1.0,
      type: 'pencil'
    });
    this.tools.set('pen', pen);

    // Register eraser tool
    const eraser = new Brush({
      size: 10,
      type: 'eraser'
    });
    this.tools.set('eraser', eraser);

    // Register selection tool
    const selectTool = new SelectTool();
    this.tools.set('select', selectTool);

    // Register shape tools
    const rectangleTool = new ShapeTool({
      shapeType: 'rectangle',
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });
    this.tools.set('rectangle', rectangleTool);

    const circleTool = new ShapeTool({
      shapeType: 'circle',
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2
    });
    this.tools.set('circle', circleTool);

    const lineTool = new ShapeTool({
      shapeType: 'line',
      stroke: '#000000',
      strokeWidth: 2
    });
    this.tools.set('line', lineTool);

    // Register text tool
    const textTool = new TextTool({
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000'
    });
    this.tools.set('text', textTool);
  }

  setupUI() {
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolName = e.target.dataset.tool;
        this.selectTool(toolName);
      });
    });

    // Color pickers
    const primaryColor = document.getElementById('color-primary');
    if (primaryColor) {
      primaryColor.addEventListener('change', (e) => {
        this.updateToolColor(e.target.value);
      });
    }

    // Color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        if (primaryColor) {
          primaryColor.value = color;
          this.updateToolColor(color);
        }
      });
    });

    // Brush size slider
    const brushSize = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    if (brushSize && brushSizeValue) {
      brushSize.addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        brushSizeValue.textContent = size;
        this.updateToolSize(size);
      });
    }

    // Opacity slider
    const opacity = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacity-value');
    if (opacity && opacityValue) {
      opacity.addEventListener('input', (e) => {
        const opacityVal = parseInt(e.target.value) / 100;
        opacityValue.textContent = `${e.target.value}%`;
        this.updateToolOpacity(opacityVal);
      });
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCanvas();
      });
    }

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Layer control buttons
    const bringToFrontBtn = document.getElementById('bring-to-front');
    if (bringToFrontBtn) {
      bringToFrontBtn.addEventListener('click', () => {
        this.canvas.bringToFront();
      });
    }

    const bringForwardBtn = document.getElementById('bring-forward');
    if (bringForwardBtn) {
      bringForwardBtn.addEventListener('click', () => {
        this.canvas.bringForward();
      });
    }

    const sendBackwardBtn = document.getElementById('send-backward');
    if (sendBackwardBtn) {
      sendBackwardBtn.addEventListener('click', () => {
        this.canvas.sendBackwards();
      });
    }

    const sendToBackBtn = document.getElementById('send-to-back');
    if (sendToBackBtn) {
      sendToBackBtn.addEventListener('click', () => {
        this.canvas.sendToBack();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Add zoom and pan functionality
    this.setupZoomAndPan();
  }

  setupZoomAndPan() {
    // Mouse wheel zoom
    this.canvas.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.setZoom(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan with Alt + drag
    let isDragging = false;
    let lastPosX, lastPosY;

    this.canvas.canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (evt.altKey === true) {
        isDragging = true;
        this.canvas.canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    this.canvas.canvas.on('mouse:move', (opt) => {
      if (isDragging) {
        const e = opt.e;
        const vpt = this.canvas.canvas.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        this.canvas.canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });

    this.canvas.canvas.on('mouse:up', (opt) => {
      isDragging = false;
      this.canvas.canvas.selection = true;
    });
  }

  selectTool(toolName) {
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`[data-tool="${toolName}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('active');
    }

    // Set tool
    const tool = this.tools.get(toolName);
    if (tool) {
      this.canvas.setTool(tool);
      this.currentTool = tool;
    }
  }

  updateToolColor(color) {
    const currentTool = this.canvas.getTool();
    if (currentTool && currentTool.setColor) {
      currentTool.setColor(color);
    }
    
    // Also update shape tools
    if (currentTool && currentTool.setStroke) {
      currentTool.setStroke(color);
    }
    
    // Update text tool
    if (currentTool && currentTool.setFill) {
      currentTool.setFill(color);
    }
  }

  updateToolSize(size) {
    const currentTool = this.canvas.getTool();
    if (currentTool && currentTool.setSize) {
      currentTool.setSize(size);
    }
    
    // Update stroke width for shape tools
    if (currentTool && currentTool.setStrokeWidth) {
      currentTool.setStrokeWidth(size);
    }
    
    // Update font size for text tool
    if (currentTool && currentTool.setFontSize) {
      currentTool.setFontSize(size);
    }
  }

  updateToolOpacity(opacity) {
    const currentTool = this.canvas.getTool();
    if (currentTool && currentTool.setOpacity) {
      currentTool.setOpacity(opacity);
    }
  }

  handleKeyboardShortcuts(e) {
    // Prevent default for our shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          // TODO: Implement undo/redo
          break;
        case 'a':
          e.preventDefault();
          if (this.currentTool && this.currentTool.selectAll) {
            this.currentTool.selectAll();
          }
          break;
        case 's':
          e.preventDefault();
          this.exportCanvas();
          break;
        case 'c':
          e.preventDefault();
          if (this.currentTool && this.currentTool.duplicateSelected) {
            this.currentTool.duplicateSelected();
          }
          break;
      }
    }
    
    // Delete key
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.currentTool && this.currentTool.deleteSelected) {
        this.currentTool.deleteSelected();
      }
    }
    
    // Tool shortcuts
    switch (e.key.toLowerCase()) {
      case 'b':
        this.selectTool('brush');
        break;
      case 'v':
        this.selectTool('select');
        break;
      case 'r':
        this.selectTool('rectangle');
        break;
      case 'c':
        if (!e.ctrlKey && !e.metaKey) {
          this.selectTool('circle');
        }
        break;
      case 't':
        this.selectTool('text');
        break;
      case 'e':
        this.selectTool('eraser');
        break;
    }
  }

  exportCanvas() {
    try {
      const dataURL = this.canvas.exportImage('png', 1.0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `canvas-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export canvas');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  showError(message) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      const loadingContent = loadingScreen.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.innerHTML = `
          <div style="color: #dc3545;">
            <h2>❌ Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Reload Page
            </button>
          </div>
        `;
      }
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.canvasApp = new CanvasApp();
}); 