<template>
  <transition-group name="notification" tag="div" class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification"
      :class="notification.type"
    >
      <div class="notification-content">
        <i :class="getIcon(notification.type)"></i>
        <div class="notification-text">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message" v-if="notification.message">
            {{ notification.message }}
          </div>
        </div>
      </div>
      <button class="notification-close" @click="remove(notification.id)">
        <i class="fa fa-times"></i>
      </button>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'NotificationContainer',
  data() {
    return {
      notifications: [],
      nextId: 0
    }
  },
  mounted() {
    // Listen for notification events
    this.$root.$on('show-notification', this.show)
  },
  beforeDestroy() {
    this.$root.$off('show-notification', this.show)
  },
  methods: {
    show(notification) {
      const id = this.nextId++
      const notif = {
        id,
        title: notification.title || 'اعلان',
        message: notification.message || '',
        type: notification.type || 'info',
        duration: notification.duration || 5000
      }
      
      this.notifications.push(notif)
      
      if (notif.duration > 0) {
        setTimeout(() => {
          this.remove(id)
        }, notif.duration)
      }
    },
    remove(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },
    getIcon(type) {
      const icons = {
        success: 'fa fa-check-circle',
        error: 'fa fa-exclamation-circle',
        warning: 'fa fa-exclamation-triangle',
        info: 'fa fa-info-circle'
      }
      return icons[type] || icons.info
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 320px;
  max-width: 400px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  backdrop-filter: blur(10px);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.notification-content i {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.notification.success {
  border-left: 4px solid var(--success-color);
}

.notification.success i {
  color: var(--success-color);
}

.notification.error {
  border-left: 4px solid var(--danger-color);
}

.notification.error i {
  color: var(--danger-color);
}

.notification.warning {
  border-left: 4px solid var(--warning-color);
}

.notification.warning i {
  color: var(--warning-color);
}

.notification.info {
  border-left: 4px solid var(--accent-color);
}

.notification.info i {
  color: var(--accent-color);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter {
  opacity: 0;
  transform: translateX(-100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>

