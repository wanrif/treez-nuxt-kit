import { defu } from 'defu'

// Import i18n composables

type MiddlewareOptions =
  | false
  | {
      /**
       * Only apply auth middleware to guest or user
       */
      only?: 'guest' | 'user' | 'admin'
      /**
       * Redirect authenticated user to this route
       */
      redirectUserTo?: string
      /**
       * Redirect guest to this route
       */
      redirectGuestTo?: string
    }

declare module '#app' {
  interface PageMeta {
    auth?: MiddlewareOptions
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: MiddlewareOptions
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  // If no route is matched, it's a 404. Let Nuxt handle it.
  if (to.matched.length === 0) {
    return
  }

  // If auth is disabled, skip middleware
  if (to.meta?.auth === false) {
    return
  }
  const { loggedIn, options, fetchSession, user } = useAuth()
  const { only, redirectUserTo, redirectGuestTo } = defu(to.meta?.auth, options)
  const { $localePath, $i18n } = useNuxtApp()

  // Check if the path is just a locale switch (e.g., "/id") or root path for default locale
  const { locales } = $i18n

  // Check if this is a language switch navigation
  const isRootPath = to.path === '/' || to.path === ''
  const isLocaleRootPath =
    isRootPath || locales.value.some((locale) => to.path === `/${locale.code}` || to.path === `/${locale.code}/`)

  // Skip auth redirection for locale root paths (language switching)
  if (isLocaleRootPath) {
    return
  }

  // Generate locale-specific redirect paths
  const localeRedirectUserTo = $localePath(redirectUserTo, $i18n.locale?.value)
  const localeRedirectGuestTo = $localePath(redirectGuestTo, $i18n.locale?.value)

  // If guest mode, redirect if authenticated
  if (only === 'guest' && loggedIn.value) {
    // Avoid infinite redirect (compare with locale-specific path)
    if (to.path === localeRedirectUserTo) {
      return
    }
    return navigateTo(localeRedirectUserTo)
  }

  // If client-side, fetch session between each navigation
  if (import.meta.client) {
    await fetchSession()
  }

  // If admin mode, check user role and redirect if not admin
  if (only === 'admin' && loggedIn.value) {
    // Ensure user data is available
    if (!user.value) {
      await fetchSession() // Fetch again if user data is missing
    }
    // Redirect if user is not an admin
    if (user.value?.role !== 'admin') {
      // Avoid infinite redirect (compare with locale-specific path)
      if (to.path === localeRedirectUserTo) {
        return
      }
      return navigateTo(localeRedirectUserTo)
    }
  }

  // If not authenticated and the page is not guest-only, redirect to guest route
  if (!loggedIn.value && only !== 'guest') {
    // Avoid infinite redirect (compare with locale-specific path)
    if (to.path === localeRedirectGuestTo) {
      return
    }
    return navigateTo(localeRedirectGuestTo)
  }
})
