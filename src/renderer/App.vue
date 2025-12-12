<template>
  <div id="app" :class="themeClass">
    <router-view></router-view>
    <notification-container />
  </div>
</template>

<script>
import NotificationContainer from './components/Partials/NotificationContainer.vue'
import ReminderService from './services/ReminderService'

export default {
  name: 'loutos',
  components: {
    NotificationContainer
  },
  computed: {
    themeClass() {
      return this.$store.getters['Theme/isDark'] ? 'dark-theme' : 'light-theme'
    }
  },
  mounted() {
    // Initialize theme
    this.$store.dispatch('Theme/initTheme')
    
    // Start reminder service
    ReminderService.startChecking()
  },
  beforeDestroy() {
    ReminderService.stopChecking()
  }
}
</script>

<style>
  /* CSS */
  @import url('~@/assets/css/normalize.css');
  @import url('~@/assets/css/bootstrap.min.css');
  @import url('~@/assets/css/bootstrap-rtl.min.css');
  @import url('~@/assets/css/font-awesome.min.css');
  @import url('~@/assets/css/style.css');

  /* Global Theme Variables */
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --text-muted: #adb5bd;
    --border-color: #dee2e6;
    --accent-color: #6366f1;
    --accent-hover: #4f46e5;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
  }

  .dark-theme {
    --bg-primary: #1a1a1a;
    --bg-secondary: #242424;
    --bg-tertiary: #2d2d2d;
    --text-primary: #f5f5f5;
    --text-secondary: #b3b3b3;
    --text-muted: #808080;
    --border-color: #404040;
    --accent-color: #818cf8;
    --accent-hover: #6366f1;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  }

  #app {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Smooth transitions */
  * {
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }
</style>
