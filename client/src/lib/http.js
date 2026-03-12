const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function buildErrorMessage(data, status) {
  if (data && typeof data === 'object' && typeof data.message === 'string') {
    return data.message
  }

  return `request failed with status ${status}`
}

export async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  })

  let data = null
  try {
    data = await response.json()
  } catch (_error) {
    data = null
  }

  if (!response.ok) {
    const error = new Error(buildErrorMessage(data, response.status))
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
