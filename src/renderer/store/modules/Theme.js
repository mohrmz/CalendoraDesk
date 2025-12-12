const state = {
  theme: 'light' 
}

const mutations = {
  SET_THEME(state, theme) {
    console.log('SET_THEME mutation called with theme:', theme)
    
    // Update state - this should be reactive
    state.theme = theme
    console.log('State updated to:', state.theme)
    
    localStorage.setItem('app.theme', theme)
    
    // Apply theme to document element immediately
    if (typeof document !== 'undefined' && document.documentElement) {
      // Remove all theme classes first
      document.documentElement.classList.remove('dark-theme', 'light-theme')
      
      // Add the new theme class
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
        console.log('Added dark-theme class to document')
      } else {
        document.documentElement.classList.add('light-theme')
        console.log('Added light-theme class to document')
      }
      
      // Set data attribute for CSS selectors
      document.documentElement.setAttribute('data-theme', theme)
      console.log('Set data-theme attribute to:', theme)
    } else {
      console.error('document or documentElement is not available')
    }
  }
}

const actions = {
  setTheme({ commit }, theme) {
    console.log('setTheme action called with theme:', theme)
    commit('SET_THEME', theme)
    console.log('setTheme action completed')
  },
  initTheme({ commit }) {
    const savedTheme = localStorage.getItem('app.theme') || 'light'
    console.log('initTheme called, saved theme:', savedTheme)
    commit('SET_THEME', savedTheme)
  }
}

const getters = {
  currentTheme: state => state.theme,
  isDark: state => state.theme === 'dark'
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

