<template>
  <div id="wrapper">
    <div class="dashboard">
      <div class="page">
        <div class="head">
          <span class="d-block h5 pr-2 pt-2">تنظیمات</span>
        </div>
      </div>
      <div class="clearfix"></div>
      <div class="tools pb-3 pt-3">
        <div class="settings-grid">
          <div class="setting-section">
            <h3 class="section-title">ظاهر</h3>
            <div class="setting-item">
              <div class="setting-label">
                <span>تم تاریک</span>
                <div class="toggle-switch" :class="{ active: isDark }" @click.stop.prevent="toggleTheme">
                  <div class="toggle-slider"></div>
                </div>
              </div>
              <p class="setting-description">استفاده از تم تاریک برای راحتی چشم</p>
            </div>
          </div>

          <div class="setting-section">
            <h3 class="section-title">عمومی</h3>
            <div class="setting-item">
              <label class="setting-label">
                <input @change="changeSetting('run_startup')" type="checkbox" class="checkbox-input" id="run_startup"
                       v-model="run_startup">
                <span>باز شدن برنامه در شروع سیستم عامل</span>
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input @change="changeSetting('active_close_button')" type="checkbox" class="checkbox-input"
                       id="active_close_button" v-model="active_close_button">
                <span>بسته شدن برنامه با کلیک روی Close</span>
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input @change="changeSetting('tray_after_minimize')" type="checkbox" class="checkbox-input"
                       id="tray_after_minimize" v-model="tray_after_minimize">
                <span>Tray شدن برنامه با کلیک روی Minimize</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script>
import Sidebar from '../Partials/Sidebar';

const AutoLaunch = require('auto-launch');

export default {
  name: "settings",
  components: {
    Sidebar
  },
  data() {
    return {
      active_close_button: false,
      tray_after_minimize: true,
      run_startup: true,
      themeUpdateKey: 0 // Force reactivity for theme changes
    }
  },
  computed: {
    isDark() {
      // Use themeUpdateKey to force reactivity
      const _ = this.themeUpdateKey
      
      // Check DOM first (most reliable)
      if (typeof document !== 'undefined' && document.documentElement) {
        const hasDarkClass = document.documentElement.classList.contains('dark-theme')
        if (hasDarkClass) return true
        const hasLightClass = document.documentElement.classList.contains('light-theme')
        if (hasLightClass) return false
      }
      
      // Fallback to localStorage
      const storedTheme = localStorage.getItem('app.theme')
      if (storedTheme === 'dark') return true
      if (storedTheme === 'light') return false
      
      // Fallback to store
      try {
        return this.$store.getters['Theme/isDark'] || false
      } catch (e) {
        const theme = this.$store.state.Theme && this.$store.state.Theme.theme ? this.$store.state.Theme.theme : 'light'
        return theme === 'dark'
      }
    }
  },
  watch: {
    '$store.state.Theme.theme': {
      handler() {
        // Force update when theme changes
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      },
      immediate: true
    }
  },
  data() {
    return {
      active_close_button: false,
      tray_after_minimize: true,
      run_startup: true,
      themeUpdateKey: 0 // Force reactivity
    }
  },
  mounted() {
    let data = Object.entries(this.$data);
    data.forEach((item) => {
      let localStorageItem = localStorage.getItem('settings.' + item[0])
      if (localStorageItem !== null) {
        this.$data[item[0]] = localStorageItem === 'true';
      } else {
        localStorage.setItem('settings.' + item[0], this.$data[item[0]].toString());
      }
    });
  },
  methods: {
    changeSetting(variable) {
      localStorage.setItem('settings.' + variable, this.$data[variable].toString());
      if (variable == 'run_startup') {
        let autoLauncher = new AutoLaunch({
          name: "Loutos"
        });
        if (this.$data[variable]) {
          autoLauncher.enable();
        } else {
          autoLauncher.disable();
        }
      }
    },
    toggleTheme() {
      console.log('toggleTheme called')
      
      // Get current theme from DOM or localStorage (more reliable)
      const currentThemeFromDOM = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light'
      const currentThemeFromStorage = localStorage.getItem('app.theme') || 'light'
      const currentTheme = currentThemeFromDOM === 'dark' || currentThemeFromStorage === 'dark' ? 'dark' : 'light'
      
      console.log('Current theme (from DOM):', currentThemeFromDOM)
      console.log('Current theme (from storage):', currentThemeFromStorage)
      console.log('Current theme (final):', currentTheme)
      
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
      console.log('New theme:', newTheme)
      
      // Apply theme to DOM immediately
      document.documentElement.classList.remove('dark-theme', 'light-theme')
      document.documentElement.classList.add(newTheme + '-theme')
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('app.theme', newTheme)
      
      // Dispatch action (vuex-electron requires dispatch, not commit)
      try {
        const dispatchResult = this.$store.dispatch('Theme/setTheme', newTheme)
        if (dispatchResult && typeof dispatchResult.catch === 'function') {
          dispatchResult.catch(e => {
            console.error('Error dispatching theme action:', e)
          })
        }
      } catch (e) {
        console.error('Error dispatching theme action:', e)
      }
      
      // Force update to ensure UI reflects the change
      this.themeUpdateKey++
      this.$nextTick(() => {
        this.$forceUpdate()
        console.log('Force update completed, isDark should be:', newTheme === 'dark')
        console.log('Current DOM classes:', document.documentElement.classList.toString())
      })
      
      // Show notification
      this.$root.$emit('show-notification', {
        type: 'success',
        title: 'تم تغییر کرد',
        message: `تم ${newTheme === 'dark' ? 'تاریک' : 'روشن'} فعال شد`
      })
    }
  },


}
</script>

<style scoped>
.page {
  width: 100%;
  padding: 20px;
  cursor: default;
}

.head {
  width: 100%;
  padding: 15px 20px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.setting-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-primary);
}

.setting-label span {
  flex: 1;
}

.setting-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
  margin-right: 0;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-left: 12px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
  background: var(--bg-tertiary);
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: var(--accent-color);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: var(--shadow-sm);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(-24px);
}

</style>