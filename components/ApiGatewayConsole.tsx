'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Key,
  Shield,
  Check,
  Copy,
  Play,
  RotateCw,
  Code2,
  Lock,
  Globe,
  BellRing,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateHmacSha256, buildSignaturePayload } from '@/lib/crypto-swift';

export default function ApiGatewayConsole() {
  const [apiKey, setApiKey] = useState('swift_live_pk_884920194821');
  const [apiSecret, setApiSecret] = useState('swift_sec_a9284019284019284019284019284019');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'nodejs' | 'python' | 'java'>('curl');

  // Interactive Playground State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/swift/track');
  const [testUetr, setTestUetr] = useState('094b8680-01f9-4d33-b5a1-0e3b8431643c');
  const [testBody, setTestBody] = useState(
    JSON.stringify({ uetr: '094b8680-01f9-4d33-b5a1-0e3b8431643c' }, null, 2)
  );

  // HMAC Sandbox State
  const [signatureNonce, setSignatureNonce] = useState('nonce_8849210');
  const [signatureTimestamp, setSignatureTimestamp] = useState(new Date().toISOString());
  const [computedSignature, setComputedSignature] = useState('');

  // Execution Result
  const [executing, setExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<number | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Recompute HMAC on change
  useEffect(() => {
    async function updateHmac() {
      const isGet = selectedEndpoint.startsWith('GET');
      const method = isGet ? 'GET' : 'POST';
      const path = isGet ? `/api/swift/track?uetr=${testUetr}` : '/api/swift/track';
      const body = isGet ? '' : testBody;

      const payload = buildSignaturePayload(method, path, signatureTimestamp, signatureNonce, body);
      const sig = await generateHmacSha256(apiSecret, payload);
      setComputedSignature(sig);
    }
    updateHmac();
  }, [apiSecret, selectedEndpoint, testUetr, testBody, signatureNonce, signatureTimestamp]);

  const handleExecute = async () => {
    setExecuting(true);
    setApiResponse(null);
    setApiStatus(null);
    const start = performance.now();

    try {
      const isGet = selectedEndpoint.startsWith('GET');
      const url = isGet ? `/api/swift/track?uetr=${encodeURIComponent(testUetr)}` : '/api/swift/track';

      const res = await fetch(url, {
        method: isGet ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SWIFT-API-Key': apiKey,
          'X-SWIFT-Timestamp': signatureTimestamp,
          'X-SWIFT-Nonce': signatureNonce,
          'X-SWIFT-Signature': computedSignature
        },
        body: isGet ? undefined : testBody
      });

      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);

      setApiStatus(res.status);
      setApiLatency(elapsed);
      setApiResponse(JSON.stringify(data, null, 2));
    } catch {
      setApiStatus(500);
      setApiResponse(JSON.stringify({ error: 'Gagal mengeksekusi request ke gateway.' }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Regenerate Keys
  const handleRegenerateKeys = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setApiKey(`swift_${environment}_pk_${randomHex.slice(0, 16)}`);
    setApiSecret(`swift_sec_${randomHex}`);
    setSignatureTimestamp(new Date().toISOString());
    setSignatureNonce(`nonce_${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Code sample generators
  const getCodeSnippet = () => {
    const isGet = selectedEndpoint.startsWith('GET');
    const endpointPath = isGet ? `/api/swift/track?uetr=${testUetr}` : '/api/swift/track';

    if (activeCodeLang === 'curl') {
      return `# 1. Contoh Pemanggilan REST API SWIFT gpi via cURL
curl -X ${isGet ? 'GET' : 'POST'} "https://api.bank-gateway.com${endpointPath}" \\
  -H "Content-Type: application/json" \\
  -H "X-SWIFT-API-Key: ${apiKey}" \\
  -H "X-SWIFT-Timestamp: ${signatureTimestamp}" \\
  -H "X-SWIFT-Nonce: ${signatureNonce}" \\
  -H "X-SWIFT-Signature: ${computedSignature}" \\
  ${isGet ? '' : `-d '${testBody.replace(/'/g, "\\'")}'`}`;
    }

    if (activeCodeLang === 'nodejs') {
      return `// 2. Integrasi Node.js (TypeScript) dengan Signature HMAC-SHA256
import crypto from 'crypto';

const apiKey = "${apiKey}";
const apiSecret = "${apiSecret}";
const timestamp = new Date().toISOString();
const nonce = "nonce_" + Math.random().toString(36).substring(7);

const method = "${isGet ? 'GET' : 'POST'}";
const path = "${endpointPath}";
const body = ${isGet ? "''" : JSON.stringify(testBody)};

// Kalkulasi signature HMAC-SHA256 sesuai standar perbankan
const payload = \`\${method}|\${path}|\${timestamp}|\${nonce}|\${body}\`;
const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

const response = await fetch("https://api.bank-gateway.com" + path, {
  method,
  headers: {
    'Content-Type': 'application/json',
    'X-SWIFT-API-Key': apiKey,
    'X-SWIFT-Timestamp': timestamp,
    'X-SWIFT-Nonce': nonce,
    'X-SWIFT-Signature': signature
  },
  body: method === 'GET' ? undefined : body
});

const result = await response.json();
console.log("Status gpi:", result);`;
    }

    if (activeCodeLang === 'python') {
      return `# 3. Integrasi Python 3 dengan requests & hmac
import requests, hmac, hashlib, datetime, json

api_key = "${apiKey}"
api_secret = "${apiSecret}"
timestamp = datetime.datetime.utcnow().isoformat() + "Z"
nonce = "nonce_python_01"

method = "${isGet ? 'GET' : 'POST'}"
path = "${endpointPath}"
body = ${isGet ? "''" : "json.dumps(" + testBody + ")"}

payload = f"{method}|{path}|{timestamp}|{nonce}|{body}"
signature = hmac.new(api_secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()

headers = {
    "Content-Type": "application/json",
    "X-SWIFT-API-Key": api_key,
    "X-SWIFT-Timestamp": timestamp,
    "X-SWIFT-Nonce": nonce,
    "X-SWIFT-Signature": signature
}

url = "https://api.bank-gateway.com" + path
res = requests.request(method, url, headers=headers, data=body if method == 'POST' else None)
print(res.json())`;
    }

    return `// 4. Integrasi Enterprise Java (Spring / OkHttp)
import okhttp3.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;

String apiKey = "${apiKey}";
String apiSecret = "${apiSecret}";
String timestamp = Instant.now().toString();
String nonce = "nonce_java_88";

// Generate HMAC-SHA256 Signature
Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
SecretKeySpec secret_key = new SecretKeySpec(apiSecret.getBytes(), "HmacSHA256");
sha256_HMAC.init(secret_key);
// Send OkHttp request with headers X-SWIFT-Signature`;
  };

  return (
    <div className="space-y-6">
      {/* API Key Management Box */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm font-semibold text-white">Kredensial API Gateway</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setEnvironment('sandbox')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  environment === 'sandbox' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sandbox Alliance Lite2
              </button>
              <button
                onClick={() => setEnvironment('production')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  environment === 'production' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live Production SAG
              </button>
            </div>

            <button
              onClick={handleRegenerateKeys}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors flex items-center gap-1.5"
              title="Buat Kunci Baru"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Regenerasi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* API Key */}
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>X-SWIFT-API-Key (Client ID):</span>
              <button
                onClick={() => copyToClipboard(apiKey)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Salin
              </button>
            </div>
            <div className="text-slate-200 select-all font-semibold break-all">{apiKey}</div>
          </div>

          {/* API Secret */}
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400 font-sans text-[11px] flex items-center justify-between">
              <span>Client Secret (HMAC Signing Secret):</span>
              <span className="text-[10px] text-amber-400 font-sans">Kerahasiaan Tingkat Bank</span>
            </div>
            <div className="text-slate-200 select-all font-semibold break-all">{apiSecret}</div>
          </div>
        </div>
      </div>

      {/* Interactive Testing Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Request Builder */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-end">
              <span className="text-xs font-mono text-slate-400">HTTP REST v2</span>
            </div>

            {/* Select Endpoint */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Pilih Endpoint API:</label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="GET /api/swift/track">GET /api/swift/track?uetr={'{uetr}'} (Query Status Realtime)</option>
                <option value="POST /api/swift/track">POST /api/swift/track (Lookup JSON Payload)</option>
                <option value="POST /api/swift/simulate">POST /api/swift/simulate (Inisiasi Simulasi pacs.008)</option>
              </select>
            </div>

            {/* Dynamic input depending on endpoint */}
            {selectedEndpoint.startsWith('GET') ? (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Target UETR (UUID):</label>
                <input
                  type="text"
                  value={testUetr}
                  onChange={(e) => setTestUetr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Request Body (JSON):</label>
                <textarea
                  rows={4}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Security Headers Inspection */}
            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Header Keamanan Terkalkulasi (Otomatis):
                </span>
                <span className="font-mono text-[10px] text-emerald-400">HMAC-SHA256 Valid</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500">X-SWIFT-Timestamp:</span> {signatureTimestamp}
                </div>
                <div>
                  <span className="text-slate-500">X-SWIFT-Nonce:</span> {signatureNonce}
                </div>
                <div className="truncate" title={computedSignature}>
                  <span className="text-slate-500">X-SWIFT-Signature:</span>{' '}
                  <span className="text-blue-400">{computedSignature}</span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={executing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {executing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Mengeksekusi Call API...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Kirim Request API (Execute Sandbox Call)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Live Response Console */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 flex flex-col h-full min-h-[380px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Response Gateway SWIFT
              </h2>
              {apiStatus !== null && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 rounded font-semibold ${
                      apiStatus === 200
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    HTTP {apiStatus}
                  </span>
                  {apiLatency !== null && <span className="text-slate-400">{apiLatency}ms</span>}
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 p-3 rounded border border-slate-800/80 font-mono text-xs text-slate-300 overflow-auto max-h-[320px]">
              {apiResponse ? (
                <pre className="whitespace-pre">{apiResponse}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <Terminal className="w-8 h-8 text-slate-700 mb-2" />
                  <div>Belum ada request yang dikirim.</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Klik &quot;Kirim Request API&quot; untuk menjalankan pengetesan live.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Cuplikan Kode Integrasi Sistem Perbankan (Production Ready)
          </h2>

          {/* Lang tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-xs">
            {(['curl', 'nodejs', 'python', 'java'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeLang(lang)}
                className={`px-3 py-1 rounded font-medium transition-colors uppercase ${
                  activeCodeLang === lang
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-slate-950 p-4 rounded border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto">
          <button
            onClick={() => copyToClipboard(getCodeSnippet())}
            className="absolute right-3 top-3 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-sans"
          >
            <Copy className="w-3.5 h-3.5" />
            Salin Kode
          </button>
          <pre className="pt-2">{getCodeSnippet()}</pre>
        </div>
      </div>
    </div>
  );
}
