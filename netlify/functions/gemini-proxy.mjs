// netlify/functions/proxy.mjs

export const handler = async (event, context) => {
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

    // 获取响应数据
    const data = await response.json();

    // 直接返回原始响应
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 允许跨域请求
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
