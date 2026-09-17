import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'books',
      component: () => import('../views/BooksListView.vue'),
    },
    {
      path: '/books/new',
      name: 'book-create',
      component: () => import('../views/BookFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/books/:id',
      name: 'book-detail',
      component: () => import('../views/BookDetailView.vue'),
    },
    {
      path: '/books/:id/edit',
      name: 'book-edit',
      component: () => import('../views/BookFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors',
      name: 'authors',
      component: () => import('../views/AuthorsListView.vue'),
    },
    {
      path: '/authors/new',
      name: 'author-create',
      component: () => import('../views/AuthorFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors/:id',
      name: 'author-detail',
      component: () => import('../views/AuthorDetailView.vue'),
    },
    {
      path: '/authors/:id/edit',
      name: 'author-edit',
      component: () => import('../views/AuthorFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/report',
      name: 'top-authors',
      component: () => import('../views/TopAuthorsView.vue'),
    },
    {
      path: '/subscribe',
      name: 'subscribe',
      component: () => import('../views/SubscribeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router