import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/downloads',
      name: 'downloads',
      component: () => import('../views/Downloads.vue'),
      meta: { requiresAuth: true }
    },
 {
      path: '/uploads',
      name: 'uploads',
      component: () => import('../views/Uploads.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/color-demo',
      name: 'color-demo',
      component: () => import('../views/ColorDemoView.vue'),
      meta: { requiresAuth: true }
    },
    // P2P Client Views werden später hinzugefügt
  ],
})

// Navigation Guard für Authentifizierung
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
