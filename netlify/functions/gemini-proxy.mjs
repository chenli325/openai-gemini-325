// netlify/functions/proxy.mjs

export const handler = async (event, context) => {
  // 支持 OPTIONS 请求，用于 CORS 预检
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  }
 console.info('req:', event.path);
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 获取原始请求的所有headers
    const headers = event.headers;
    
    // 构建转发请求
    const response = await fetch('https://generativelanguage.googleapis.com' + event.path, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: event.body, // 直接转发请求体
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // 获取响应的原始文本
    const responseText = await response.text();
    console.info('resp:', responseText);
    // 直接返回原始响应
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: responseText, // 直接返回原始响应文本
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message,
        path: event.path,
        body: event.body 
      }),
    };
  }
};
