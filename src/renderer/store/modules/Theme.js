const state = {
  theme: 'light' // 'light' or 'dark'
}

const mutations = {
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('app.theme', theme)
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
  }
}

const actions = {
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  initTheme({ commit }) {
    const savedTheme = localStorage.getItem('app.theme') || 'light'
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

