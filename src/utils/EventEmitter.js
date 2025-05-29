export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
    return this;
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  off(event, listener) {
    if (!this.events.has(event)) return this;
    
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
    
    return this;
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    
    const listeners = this.events.get(event).slice();
    
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }
    
    return true;
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  eventNames() {
    return Array.from(this.events.keys());
  }
} 