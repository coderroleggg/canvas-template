export class AnimationLoop {
  constructor(canvas) {
    this.canvas = canvas;
    this.isRunning = false;
    this.animationId = null;
    
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsUpdateTime = 0;
    
    this.maxFPS = canvas.options.maxFPS || 60;
    this.targetFrameTime = 1000 / this.maxFPS;
    
    this.animations = new Set();
    
    // Bind the loop function
    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop);
    
    this.canvas.emit('animationStart');
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.canvas.emit('animationStop');
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    
    // FPS limiting
    if (this.deltaTime < this.targetFrameTime) {
      this.animationId = requestAnimationFrame(this.loop);
      return;
    }
    
    this.lastTime = currentTime;
    
    // Update FPS counter
    this.updateFPS(currentTime);
    
    // Update animations
    this.updateAnimations(this.deltaTime);
    
    // Render frame
    if (this.canvas.renderer) {
      this.canvas.renderer.render();
    }
    
    // Emit frame event
    this.canvas.emit('frame', {
      deltaTime: this.deltaTime,
      fps: this.fps,
      frameCount: this.frameCount
    });
    
    this.frameCount++;
    
    // Schedule next frame
    this.animationId = requestAnimationFrame(this.loop);
  }

  updateFPS(currentTime) {
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      
      // Update FPS display
      this.updateFPSDisplay();
    }
  }

  updateFPSDisplay() {
    const fpsElement = document.getElementById('fps-counter');
    if (fpsElement) {
      fpsElement.textContent = `FPS: ${this.fps}`;
    }
  }

  updateAnimations(deltaTime) {
    for (const animation of this.animations) {
      if (animation.update) {
        animation.update(deltaTime);
        
        if (animation.isComplete && animation.isComplete()) {
          this.removeAnimation(animation);
        }
      }
    }
  }

  addAnimation(animation) {
    this.animations.add(animation);
    
    if (animation.onStart) {
      animation.onStart();
    }
    
    return animation;
  }

  removeAnimation(animation) {
    if (this.animations.has(animation)) {
      this.animations.delete(animation);
      
      if (animation.onComplete) {
        animation.onComplete();
      }
    }
  }

  clearAnimations() {
    for (const animation of this.animations) {
      if (animation.onComplete) {
        animation.onComplete();
      }
    }
    this.animations.clear();
  }

  setMaxFPS(fps) {
    this.maxFPS = fps;
    this.targetFrameTime = 1000 / fps;
  }

  getStats() {
    return {
      fps: this.fps,
      deltaTime: this.deltaTime,
      frameCount: this.frameCount,
      animationCount: this.animations.size,
      isRunning: this.isRunning
    };
  }

  destroy() {
    this.stop();
    this.clearAnimations();
  }
} 