// src/services/alertSocket.js
class AlertSocket {
  constructor() {
    this.socket = null;
    this.eventListeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.baseUrl = process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000';
    this.pingInterval = 30000;
    this.pingTimeout = null;
  }

  connect(orgId, userId) {
    if (this.socket) {
      this.disconnect();
    }

    const socketUrl = `${this.baseUrl}/ws/online-tracking/${orgId}/${userId}`;
    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startPing();
      this.emit('connect', { orgId, userId });
    };

    this.socket.onmessage = (event) => {
      this.resetPing();
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') return;
        this.emit('message', data);
      } catch (error) {
        this.emit('error', { 
          type: 'parse_error', 
          error: error.message,
          rawData: event.data 
        });
      }
    };

    this.socket.onclose = (event) => {
      this.clearPing();
      this.emit('disconnect', event);
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(
          this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
          30000
        );
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(orgId, userId);
        }, delay);
      }
    };

    this.socket.onerror = (error) => {
      this.emit('error', { 
        type: 'connection_error', 
        error: error.message || 'Unknown WebSocket error' 
      });
    };
  }

  send(data) {
    if (this.isConnected()) {
      try {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        this.socket.send(payload);
      } catch (error) {
        this.emit('error', { 
          type: 'send_error', 
          error: error.message 
        });
      }
    }
  }

  disconnect() {
    this.clearPing();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  emit(event, ...args) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(...args));
    }
  }

  startPing() {
    this.clearPing();
    this.pingTimeout = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.pingInterval);
  }

  resetPing() {
    this.clearPing();
    this.startPing();
  }

  clearPing() {
    if (this.pingTimeout) {
      clearInterval(this.pingTimeout);
      this.pingTimeout = null;
    }
  }
}

export const alertSocket = new AlertSocket();