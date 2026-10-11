/**
 * SWIFT gpi Secure Gateway Cryptographic Signature Utility
 * Standard HMAC-SHA256 signature standard used in banking API gateways (ISO 20022 RESTful APIs)
 */

export async function generateHmacSha256(
  secretKey: string,
  message: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function buildSignaturePayload(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  bodyString: string = ''
): string {
  return `${method.toUpperCase()}|${path}|${timestamp}|${nonce}|${bodyString}`;
}
