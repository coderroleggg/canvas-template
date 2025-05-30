# 🎨 2D Canvas Template

A comprehensive and modular 2D canvas template for creating browser-based graphics applications, animations, and games. Perfect for building applications like Miro, Excalidraw, Paint, Photoshop, Canva, and more.

Built on top of **Fabric.js** - a powerful library for working with HTML5 Canvas.

## ✨ Features

- **🎯 Fabric.js Core**: Uses Fabric.js for optimized canvas operations
- **🖱️ Input Handling**: Mouse, keyboard, and touch support
- **🎨 Drawing Tools**: Brush, pen, shapes, text, eraser, selection
- **📚 Layer Management**: Multi-layer support with management capabilities
- **🎭 Animation System**: Smooth object animations
- **🎮 Game Features**: Simple game with physics and controls
- **🌐 Keyboard Layout Support**: Works with both English and Russian keyboard layouts
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **⚡ Performance Optimized**: Efficient rendering and memory management
- **🔧 Modular Architecture**: Extensible component system

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Option 1: Development Server (Recommended)
```bash
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
│   ├── core/              # Core application engine
│   │   ├── Canvas.js      # Main canvas class (Fabric.js wrapper)
│   │   └── AnimationLoop.js # Animation loop
│   ├── tools/             # Drawing tools
│   │   ├── Brush.js       # Brush/pen/eraser tool
│   │   ├── SelectTool.js  # Selection tool
│   │   ├── ShapeTool.js   # Shape tools
│   │   └── TextTool.js    # Text tool
│   ├── layers/            # Layer management
│   │   └── FabricLayerManager.js # Fabric.js layer manager
│   ├── utils/             # Utilities
│   │   └── EventEmitter.js # Event system
│   └── main.js            # Main application file
├── styles/                # CSS styles
│   └── main.css          # Main styles
├── index.html            # Main page
├── package.json          # Dependencies and scripts
└── README.md            # Documentation
```

## 🎯 Usage Examples

### 1. 🎨 Drawing Application (Drawing App)
Full-featured drawing application with tools:
- **Brush and Pen**: Various sizes and opacity
- **Shapes**: Rectangles, circles, lines
- **Text**: Adding text elements
- **Eraser**: Removing parts of the image
- **Selection**: Moving and transforming objects
- **Colors**: Color palette and swatches
- **Layers**: Image layer management
- **Export**: Save to PNG format

### 2. 🎮 Simple Game (Simple Game)
Pong-style game with features:
- **Controls**: W/S keys (Ц/Ы for Russian layout) to move paddle
- **Physics**: Ball bouncing off walls and paddle
- **Score**: Scoring system
- **Reset**: Automatic reset on game over
- **60 FPS**: Smooth game loop

### 3. 🎭 Animation Demo (Animation Demo)
Demonstration of animation capabilities:
- **Floating Circles**: Movement with wall bouncing
- **Rotating Squares**: Orbital movement
- **Scaling**: Pulsing effects
- **Color Effects**: HSL color animation

## 🔧 Core Classes

### Canvas (src/core/Canvas.js)
Main wrapper class over Fabric.js:
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
  opacity: 1.0,
  type: 'pencil' // 'pencil' | 'eraser'
});

canvas.setTool(brush);
```

### Layer Management
```javascript
import { FabricLayerManager } from './src/layers/FabricLayerManager.js';

const layerManager = new FabricLayerManager(canvas);
layerManager.addLayer();
layerManager.bringToFront();
```

## ⌨️ Keyboard Shortcuts

### General
- **B** - Brush
- **V** - Selection  
- **R** - Rectangle
- **C** - Circle
- **T** - Text
- **E** - Eraser
- **Ctrl/Cmd + S** - Export
- **Ctrl/Cmd + A** - Select All
- **Delete/Backspace** - Delete Selected

### Game
- **W/Ц** - Move paddle up
- **S/Ы** - Move paddle down

### Navigation
- **Alt + Drag** - Pan
- **Mouse Wheel** - Zoom

## 🎨 Configuration and Customization

### Color Scheme
Customize appearance through CSS variables in `styles/main.css`:
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #dee2e6;
}
```

### Adding New Tools
Create a new tool by extending the base class:
```javascript
class MyTool {
  activate(canvas) {
    // Tool activation logic
  }
  
  deactivate() {
    // Tool deactivation logic
  }
}
```

## 🔧 Dependencies

### Main
- **Fabric.js ^6.0.0** - Canvas library
- **Vite ^5.0.0** - Build tool (dev)

### Fabric.js Features
- Interactive objects
- JSON/SVG serialization
- Image filters and effects
- Object grouping
- Transformations and animations

## 📱 Mobile Support

The template includes full touch device support:
- Touch gestures for drawing
- Responsive canvas sizing
- Mobile-optimized UI components
- Performance optimizations for mobile devices

## 🚀 Performance Tips

1. **Use layers wisely**: Separate static and dynamic content
2. **Optimize rendering calls**: Group similar operations
3. **Use requestAnimationFrame**: For smooth animations
4. **Configure object caching**: `fabric.Object.prototype.objectCaching = true`
5. **Limit object count**: Remove unnecessary elements

## 🛠️ Development

### Code Structure
- ES6+ modules
- Event system
- Modular architecture
- Separation of concerns

### Adding New Examples
1. Create a new function in `CanvasApp`
2. Add button to navigation
3. Register handler in `setupUI()`
4. Implement switching logic in `switchExample()`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Create a pull request

## 📄 License

MIT License - use this template for any projects!

## 🙏 Acknowledgments

- **Fabric.js** - for the powerful canvas library
- Inspired by popular graphics applications
- Built with modern web standards 