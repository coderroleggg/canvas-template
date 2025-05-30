import { Canvas } from './core/Canvas.js';
import { FabricLayerManager } from './layers/FabricLayerManager.js';
import { Brush } from './tools/Brush.js';
import { SelectTool } from './tools/SelectTool.js';
import { ShapeTool } from './tools/ShapeTool.js';
import { TextTool } from './tools/TextTool.js';

class CanvasApp {
  constructor() {
    this.canvas = null;
    this.layerManager = null;
    this.tools = new Map();
    this.currentTool = null;
    this.currentExample = 'drawing';
    this.gameLoop = null;
    this.animationFrame = null;
    
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
      
      // Initialize layer manager
      this.layerManager = new FabricLayerManager(this.canvas);
      
      // Register tools
      this.registerTools();
      
      // Set default tool
      this.selectTool('brush');
      
      // Setup UI event listeners
      this.setupUI();
      
      // Start canvas
      this.canvas.start();
      
      // Initialize default example (drawing app)
      this.initDrawingApp();
      
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
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      fillEnabled: true
    });
    this.tools.set('rectangle', rectangleTool);

    const circleTool = new ShapeTool({
      shapeType: 'circle',
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      fillEnabled: true
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
    // Example navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const example = e.target.dataset.example;
        this.switchExample(example);
      });
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toolName = e.target.dataset.tool;
        this.selectTool(toolName);
      });
    });

    // Color pickers
    const strokeColor = document.getElementById('color-stroke');
    const fillColor = document.getElementById('color-fill');
    const fillEnabled = document.getElementById('fill-enabled');
    
    if (strokeColor) {
      strokeColor.addEventListener('change', (e) => {
        this.updateStrokeColor(e.target.value);
      });
    }
    
    if (fillColor) {
      fillColor.addEventListener('change', (e) => {
        this.updateFillColor(e.target.value);
      });
    }
    
    if (fillEnabled) {
      fillEnabled.addEventListener('change', (e) => {
        this.updateFillEnabled(e.target.checked);
      });
    }

    // Color swatches - when clicked, update stroke color
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const color = e.target.dataset.color;
        if (strokeColor) {
          strokeColor.value = color;
          this.updateStrokeColor(color);
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
        this.layerManager.bringToFront();
      });
    }

    const bringForwardBtn = document.getElementById('bring-forward');
    if (bringForwardBtn) {
      bringForwardBtn.addEventListener('click', () => {
        this.layerManager.bringForward();
      });
    }

    const sendBackwardBtn = document.getElementById('send-backward');
    if (sendBackwardBtn) {
      sendBackwardBtn.addEventListener('click', () => {
        this.layerManager.sendBackward();
      });
    }

    const sendToBackBtn = document.getElementById('send-to-back');
    if (sendToBackBtn) {
      sendToBackBtn.addEventListener('click', () => {
        this.layerManager.sendToBack();
      });
    }

    // Add Layer button
    const addLayerBtn = document.getElementById('add-layer');
    if (addLayerBtn) {
      addLayerBtn.addEventListener('click', () => {
        this.layerManager.addLayer();
      });
    }
    
    // Layer move buttons
    const layerUpBtn = document.getElementById('layer-up');
    if (layerUpBtn) {
      layerUpBtn.addEventListener('click', () => {
        this.layerManager.bringForward();
      });
    }
    
    const layerDownBtn = document.getElementById('layer-down');
    if (layerDownBtn) {
      layerDownBtn.addEventListener('click', () => {
        this.layerManager.sendBackward();
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

  updateStrokeColor(color) {
    const currentTool = this.canvas.getTool();
    // Update brush/pen color
    if (currentTool && currentTool.setColor) {
      currentTool.setColor(color);
    }
    // Update shape stroke
    if (currentTool && currentTool.setStroke) {
      currentTool.setStroke(color);
    }
    // Update text color
    if (currentTool && currentTool.setFill && currentTool.constructor.name === 'TextTool') {
      currentTool.setFill(color);
    }
  }
  
  updateFillColor(color) {
    const currentTool = this.canvas.getTool();
    // Update shape fill
    if (currentTool && currentTool.setFill && currentTool.constructor.name === 'ShapeTool') {
      currentTool.setFill(color);
    }
  }
  
  updateFillEnabled(enabled) {
    const currentTool = this.canvas.getTool();
    if (currentTool && currentTool.setFillEnabled) {
      currentTool.setFillEnabled(enabled);
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

  // Example switching functionality
  switchExample(example) {
    // Update navigation UI
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`[data-example="${example}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('active');
    }

    // Stop any running loops
    this.stopCurrentExample();

    // Clear canvas
    this.canvas.clear();

    // Switch to new example
    this.currentExample = example;
    
    switch (example) {
      case 'drawing':
        this.initDrawingApp();
        break;
      case 'game':
        this.initSimpleGame();
        break;
      case 'animation':
        this.initAnimationDemo();
        break;
    }
  }

  stopCurrentExample() {
    // Stop game loop
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    // Stop animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Call cleanup function if exists
    if (this.gameCleanup) {
      this.gameCleanup();
      this.gameCleanup = null;
    }
  }

  initDrawingApp() {
    // Show toolbar for drawing app
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.style.display = 'flex';
    }
    
    // Set default tool
    this.selectTool('brush');
  }

  initSimpleGame() {
    // Hide toolbar for game
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.style.display = 'none';
    }

    // Initialize simple game
    this.setupSimpleGame();
  }

  initAnimationDemo() {
    // Hide toolbar for animation
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.style.display = 'none';
    }

    // Initialize animation demo
    this.setupAnimationDemo();
  }

  setupSimpleGame() {
    // Simple Pong-like game
    const canvas = this.canvas.canvas;
    
    // Game state
    const game = {
      paddle: {
        x: 50,
        y: canvas.height / 2 - 50,
        width: 15,
        height: 100,
        speed: 8
      },
      ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 3
      },
      score: 0,
      isRunning: true
    };

    // Add instructions text
    const instructionsText = new fabric.Text('Use W/S keys to move paddle\nKeep the ball in play!', {
      left: canvas.width / 2,
      top: 50,
      originX: 'center',
      fontSize: 20,
      fill: '#666',
      textAlign: 'center',
      selectable: false
    });
    canvas.add(instructionsText);

    // Add score text
    const scoreText = new fabric.Text('Score: 0', {
      left: canvas.width / 2,
      top: 100,
      originX: 'center',
      fontSize: 24,
      fill: '#333',
      selectable: false
    });
    canvas.add(scoreText);

    // Create paddle
    const paddle = new fabric.Rect({
      left: game.paddle.x,
      top: game.paddle.y,
      width: game.paddle.width,
      height: game.paddle.height,
      fill: '#2196F3',
      selectable: false,
      evented: false
    });
    canvas.add(paddle);

    // Create ball
    const ball = new fabric.Circle({
      left: game.ball.x - game.ball.radius,
      top: game.ball.y - game.ball.radius,
      radius: game.ball.radius,
      fill: '#FF5722',
      selectable: false,
      evented: false
    });
    canvas.add(ball);

    // Render canvas
    canvas.renderAll();

    // Keyboard controls
    const keys = {};
    
    const handleKeyDown = (e) => {
      keys[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e) => {
      keys[e.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Game loop
    this.gameLoop = setInterval(() => {
      if (!game.isRunning) return;

      // Move paddle
      if (keys['w'] && game.paddle.y > 0) {
        game.paddle.y -= game.paddle.speed;
        paddle.set('top', game.paddle.y);
      }
      if (keys['s'] && game.paddle.y < canvas.height - game.paddle.height) {
        game.paddle.y += game.paddle.speed;
        paddle.set('top', game.paddle.y);
      }

      // Move ball
      game.ball.x += game.ball.speedX;
      game.ball.y += game.ball.speedY;

      // Ball collision with walls
      if (game.ball.y <= game.ball.radius || game.ball.y >= canvas.height - game.ball.radius) {
        game.ball.speedY = -game.ball.speedY;
      }

      // Ball collision with right wall (bounce back)
      if (game.ball.x >= canvas.width - game.ball.radius) {
        game.ball.speedX = -game.ball.speedX;
      }

      // Ball collision with paddle
      if (game.ball.x - game.ball.radius <= game.paddle.x + game.paddle.width &&
          game.ball.y >= game.paddle.y &&
          game.ball.y <= game.paddle.y + game.paddle.height &&
          game.ball.speedX < 0) {
        game.ball.speedX = -game.ball.speedX;
        game.score += 10;
        scoreText.set('text', `Score: ${game.score}`);
      }

      // Ball goes off left side (game over)
      if (game.ball.x < -game.ball.radius) {
        // Reset ball
        game.ball.x = canvas.width / 2;
        game.ball.y = canvas.height / 2;
        game.ball.speedX = Math.abs(game.ball.speedX);
        game.score = Math.max(0, game.score - 50);
        scoreText.set('text', `Score: ${game.score}`);
      }

      // Update ball position (adjust for Fabric.js coordinates)
      ball.set({
        left: game.ball.x - game.ball.radius,
        top: game.ball.y - game.ball.radius
      });

      canvas.renderAll();
    }, 1000 / 60); // 60 FPS

    // Cleanup function when switching examples
    this.gameCleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }

  setupAnimationDemo() {
    const canvas = this.canvas.canvas;
    
    // Create animated elements
    const elements = [];
    
    // Add title
    const titleText = new fabric.Text('Animation Demo', {
      left: canvas.width / 2,
      top: 50,
      originX: 'center',
      fontSize: 32,
      fill: '#333',
      selectable: false
    });
    canvas.add(titleText);

    // Create floating circles
    for (let i = 0; i < 8; i++) {
      const circle = new fabric.Circle({
        left: Math.random() * canvas.width,
        top: Math.random() * canvas.height + 100,
        radius: 20 + Math.random() * 30,
        fill: `hsl(${Math.random() * 360}, 70%, 60%)`,
        selectable: false
      });
      
      // Add animation properties
      circle.animProps = {
        speedX: (Math.random() - 0.5) * 4,
        speedY: (Math.random() - 0.5) * 4,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        scaleDirection: 1,
        scaleSpeed: 0.01 + Math.random() * 0.02
      };
      
      canvas.add(circle);
      elements.push(circle);
    }

    // Create rotating squares
    for (let i = 0; i < 5; i++) {
      const rect = new fabric.Rect({
        left: Math.random() * canvas.width,
        top: Math.random() * canvas.height + 100,
        width: 30 + Math.random() * 40,
        height: 30 + Math.random() * 40,
        fill: `hsl(${Math.random() * 360}, 80%, 50%)`,
        selectable: false,
        angle: Math.random() * 360
      });
      
      rect.animProps = {
        rotationSpeed: (Math.random() - 0.5) * 5,
        orbitRadius: 50 + Math.random() * 100,
        orbitSpeed: 0.02 + Math.random() * 0.03,
        orbitAngle: Math.random() * Math.PI * 2,
        centerX: rect.left,
        centerY: rect.top
      };
      
      canvas.add(rect);
      elements.push(rect);
    }

    // Animation loop
    const animate = () => {
      elements.forEach(element => {
        const props = element.animProps;
        
        if (element instanceof fabric.Circle) {
          // Move circles
          let newLeft = element.left + props.speedX;
          let newTop = element.top + props.speedY;
          
          // Bounce off walls
          if (newLeft <= element.radius || newLeft >= canvas.width - element.radius) {
            props.speedX = -props.speedX;
            newLeft = element.left + props.speedX;
          }
          if (newTop <= element.radius || newTop >= canvas.height - element.radius) {
            props.speedY = -props.speedY;
            newTop = element.top + props.speedY;
          }
          
          element.set({
            left: newLeft,
            top: newTop,
            angle: element.angle + props.rotationSpeed
          });

          // Pulsing scale effect
          const currentScale = element.scaleX || 1;
          const newScale = currentScale + (props.scaleSpeed * props.scaleDirection);
          
          if (newScale > 1.3 || newScale < 0.7) {
            props.scaleDirection = -props.scaleDirection;
          }
          
          element.set({
            scaleX: newScale,
            scaleY: newScale
          });
          
        } else if (element instanceof fabric.Rect) {
          // Rotate squares
          element.set('angle', element.angle + props.rotationSpeed);
          
          // Orbital movement
          props.orbitAngle += props.orbitSpeed;
          const newLeft = props.centerX + Math.cos(props.orbitAngle) * props.orbitRadius;
          const newTop = props.centerY + Math.sin(props.orbitAngle) * props.orbitRadius;
          
          element.set({
            left: newLeft,
            top: newTop
          });
        }
      });
      
      canvas.renderAll();
      
      if (this.currentExample === 'animation') {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animate();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.canvasApp = new CanvasApp();
}); 