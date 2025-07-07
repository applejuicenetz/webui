import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import DefaultLayout from '../layouts/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/app',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/app/dashboard',
    children: [
      {
        path: '/app/dashboard',
        name: 'Dashboard',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(
            /* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'
          ),
      },
      {
        path: '/app/downloads',
        name: 'Downloads',
        component: () => import('../views/Downloads.vue'),
      },
      {
        path: '/app/uploads',
        name: 'Uploads',
        component: () => import('../views/Uploads.vue'),
      },
      {
        path: '/app/server',
        name: 'Server',
        component: () => import('../views/ServerList.vue'),
      },
      {
        path: '/app/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
      },
      {
        path: '/app/shares',
        name: 'Shares',
        component: () => import('../views/Shares.vue'),
      },
    ],
  },
  {
    path: '/404',
    name: 'Page404',
    component: () => import('../views/Page404.vue'),
  },

]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

// Authentication Guard - wird in main.js nach Pinia-Installation hinzugefügt
export function setupRouterGuards() {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Öffentliche Routen (Login, 404)
    const publicRoutes = ['/', '/404']
    const isPublicRoute = publicRoutes.includes(to.path)

    // Wenn öffentliche Route, direkt weiterleiten
    if (isPublicRoute) {
      // Wenn bereits eingeloggt und auf Login-Seite, zum Dashboard weiterleiten
      if (to.path === '/' && authStore.isAuthenticated) {
        const isValid = await authStore.testStoredConnection()
        if (isValid) {
          next('/app/dashboard')
          return
        }
      }
      next()
      return
    }

    // Für geschützte Routen: Authentifizierung prüfen
    if (!authStore.isAuthenticated) {
      // Nicht eingeloggt - zum Login weiterleiten
      next('/')
      return
    }

    // Gespeicherte Verbindung testen
    try {
      const isValid = await authStore.testStoredConnection()
      if (isValid) {
        next()
      } else {
        // Verbindung ungültig - zum Login weiterleiten
        next('/')
      }
    } catch (error) {
      console.error('Authentifizierungsfehler:', error)
      next('/')
    }
  })
}

export default router
