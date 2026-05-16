const TOKEN_COOKIE_NAME = 'token'

export const setAuthCookie = (value: string) => {
  const maxAge = 60 * 60 * 24 * 7

  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`
}

export const getAuthCookie = () => {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${TOKEN_COOKIE_NAME}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

export const storeAuthToken = (value: unknown) => {
  const token =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object'
        ? ((value as { token?: unknown; accessToken?: unknown }).token ??
          (value as { token?: unknown; accessToken?: unknown }).accessToken ??
          (value as { data?: { token?: unknown; accessToken?: unknown } }).data?.token ??
          (value as { data?: { token?: unknown; accessToken?: unknown } }).data?.accessToken)
        : ''

  if (typeof token === 'string' && token.trim()) {
    const normalizedToken = token.trim()
    setAuthCookie(normalizedToken)
    localStorage.setItem(TOKEN_COOKIE_NAME, normalizedToken)
    return normalizedToken
  }

  return ''
}

export const getStoredAuthToken = () => {
  return localStorage.getItem(TOKEN_COOKIE_NAME) || getAuthCookie()
}

export const clearStoredAuthToken = () => {
  localStorage.removeItem(TOKEN_COOKIE_NAME)
  document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}
