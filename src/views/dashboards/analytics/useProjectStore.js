import axios from '@axios'
import { defineStore } from 'vuex'

export const useProjectStore = defineStore('ProjectStore', {
  actions: {
    // 👉 Fetch all project
    fetchProjects(params) {
      return axios.get('/dashboard/analytics/projects', { params })
    },
  },
})
