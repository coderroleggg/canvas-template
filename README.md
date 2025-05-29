# 🎨 2D Canvas Template

A comprehensive and modular 2D canvas template for creating browser-based graphics applications, animations, and games. Perfect for building applications like Miro, Excalidraw, Paint, Photoshop, Canva, and more.

## ✨ Features

- **🎯 Core Canvas Engine**: Optimized rendering loop with requestAnimationFrame
- **🖱️ Input Handling**: Mouse, keyboard, and touch support
- **🎨 Drawing Tools**: Brush, pen, shapes, text, and custom tools
- **📚 Layer Management**: Multiple layers with blending modes
- **🎭 Animation System**: Tweening, easing, and timeline animations
- **🔧 Plugin Architecture**: Extensible plugin system
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **⚡ Performance Optimized**: Efficient rendering and memory management
- **🎮 Game Ready**: Collision detection, sprite management, physics
- **🎪 Examples Included**: Drawing app, simple game, animation demos

## 🚀 Quick Start

### Option 1: Development Server (Recommended)
```bash
npm install
npm run dev
```

### Option 2: Simple HTTP Server
```bash
npm run serve
```

Then open your browser to `http://localhost:8000` (or the port shown in terminal).

## 📁 Project Structure

```
canvas-template/
├── src/
│   ├── core/              # Core canvas engine
│   │   ├── Canvas.js      # Main canvas class
│   │   ├── Renderer.js    # Rendering engine
│   │   ├── InputManager.js # Input handling
│   │   └── AnimationLoop.js # Animation loop
│   ├── tools/             # Drawing tools
│   │   ├── Brush.js       # Brush tool
│   │   ├── Shape.js       # Shape tools
│   │   └── Text.js        # Text tool
│   ├── layers/            # Layer management
│   ├── animations/        # Animation system
│   ├── plugins/           # Plugin system
│   └── utils/             # Utility functions
├── examples/              # Example applications
│   ├── drawing-app/       # Drawing application
│   ├── simple-game/       # Simple game
│   └── animation-demo/    # Animation examples
├── assets/                # Static assets
└── docs/                  # Documentation
```

## 🎯 Usage Examples

### Basic Canvas Setup
```javascript
import { Canvas } from './src/core/Canvas.js';

const canvas = new Canvas({
  container: '#canvas-container',
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});

canvas.start();
```

### Drawing Tools
```javascript
import { Brush } from './src/tools/Brush.js';

const brush = new Brush({
  size: 5,
  color: '#000000',
  opacity: 1.0
});

canvas.setTool(brush);
```

### Animations
```javascript
import { Animation } from './src/animations/Animation.js';

const animation = new Animation({
  duration: 1000,
  easing: 'easeInOut',
  onUpdate: (progress) => {
    // Animation logic
  }
});

canvas.addAnimation(animation);
```

## 🔧 Configuration

The template is highly configurable. See `src/core/Config.js` for all available options:

```javascript
const config = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    pixelRatio: window.devicePixelRatio || 1
  },
  performance: {
    maxFPS: 60,
    enableVSync: true,
    optimizeOffscreen: true
  },
  input: {
    enableMouse: true,
    enableTouch: true,
    enableKeyboard: true
  }
};
```

## 🎮 Examples

### 1. Drawing Application
A complete drawing app with brushes, shapes, layers, and export functionality.
- Location: `examples/drawing-app/`
- Features: Multiple tools, color picker, layer management

### 2. Simple Game
A basic 2D game demonstrating sprites, collision detection, and game loop.
- Location: `examples/simple-game/`
- Features: Player movement, collision detection, scoring

### 3. Animation Demo
Various animation examples showing the animation system capabilities.
- Location: `examples/animation-demo/`
- Features: Tweening, easing functions, timeline animations

## 🔌 Plugin System

Create custom plugins to extend functionality:

```javascript
class CustomTool {
  constructor(options) {
    this.name = 'custom-tool';
    this.options = options;
  }

  onMouseDown(event) {
    // Tool logic
  }

  onMouseMove(event) {
    // Tool logic
  }

  onMouseUp(event) {
    // Tool logic
  }
}

canvas.registerPlugin(new CustomTool());
```

## 📱 Mobile Support

The template includes full touch support and responsive design:

- Touch gestures for drawing and navigation
- Responsive canvas sizing
- Mobile-optimized UI components
- Performance optimizations for mobile devices

## 🎨 Customization

### Themes
Customize the appearance with CSS variables:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
}
```

### Tools
Add custom drawing tools by extending the base Tool class:

```javascript
import { Tool } from './src/tools/Tool.js';

class MyCustomTool extends Tool {
  // Implement your tool logic
}
```

## 🚀 Performance Tips

1. **Use layers wisely**: Separate static and dynamic content
2. **Optimize drawing calls**: Batch similar operations
3. **Enable offscreen rendering**: For complex static elements
4. **Use requestAnimationFrame**: For smooth animations
5. **Implement viewport culling**: Only render visible elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this template for any project!

## 🙏 Acknowledgments

- Inspired by popular graphics applications like Miro, Excalidraw, and Canva
- Built with modern web standards and best practices
- Optimized for performance and extensibility 