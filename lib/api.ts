export const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return ''
  }
  return 'http://localhost:8000'
}

export const API_URL = getApiUrl()

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiUrl()
  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch (err) {
    // If localhost python is down or network failed, fallback to internal Next.js API
    if (base !== '') {
      response = await fetch(path, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      })
    } else {
      throw err
    }
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: 'The demo service could not complete the request.' }))
    throw new Error(detail.detail ?? 'Request failed')
  }
  return response.json() as Promise<T>
}

