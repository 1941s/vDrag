import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 需要根据实际需求扩展
const getters = {
  user_roles: state => state.user ? state.user.roles : []
}

export default new Vuex.Store({
  state: {
    user: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user)
    }
  },
  getters,
  modules: {}
}) 