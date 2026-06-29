/**
 * Decode a JWT payload (base64url → JSON) without a library.
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Extract role string from token ("ROLE_MANAGER" → "MANAGER") */
export function getRoleFromToken(token) {
  const payload = decodeJwt(token)
  if (!payload) return null
  // Spring Security stores authorities as an array
  const authorities = payload.authorities || payload.roles || []
  if (Array.isArray(authorities) && authorities.length > 0) {
    const role = authorities[0]
    return typeof role === 'string'
      ? role.replace('ROLE_', '')
      : role?.authority?.replace('ROLE_', '')
  }
  return null
}

export function saveSession(token) {
  localStorage.setItem('token', token)
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function isLoggedIn() {
  return !!getToken()
}
