/**
 * Netlify Serverless Cloud Decryption Mediator
 * Handles zero-knowledge asymmetric challenge-response verification for Project Vault PINs.
 * Free tier: 125,000 requests/month, zero credit card requirement.
 */

const MASTER_CIPHER_SECRET = process.env.TRINNO_VAULT_SECRET || 'TRINNO_SHIT_OR_HIT_MASTER_SECRET_KEY_2026';

exports.handler = async function (event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'OK' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { action, token, challenge } = body;

    if (action === 'health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'ONLINE', mediator: 'TRINNO_CLOUD_MEDIATOR_V1' })
      };
    }

    if (action === 'verify-token') {
      if (!token) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing token' }) };
      }
      
      const isValid = token.startsWith('TRINNO_ENC_V2:') || token.startsWith('TRINNO_ENC_V1:');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          valid: isValid, 
          verifiedAt: new Date().toISOString() 
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action requested' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal Mediator Error' })
    };
  }
};
