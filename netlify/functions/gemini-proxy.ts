import { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/gemini-proxy', '')
  const targetUrl = `https://generativelanguage.googleapis.com${path}${event.rawQuery ? `?${event.rawQuery}` : ''}`

  try {
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(event.headers)) {
      if (value && !['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    }

    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: headers,
      body: event.body,
    })

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    return {
      statusCode: response.status,
      headers: {
        ...responseHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
      body: await response.text(),
    }
  } catch (error) {
    console.error('Proxy request error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: 'Proxy Error',
    }
  }
}

export { handler }
