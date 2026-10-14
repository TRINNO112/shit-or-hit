/**
 * 🏛️ CENTRAL SOVEREIGN AI GATEWAY (Client-Side Dispatcher)
 * 
 * Manages privacy-first, zero-training AI routing for:
 * 1. Diary Ghostwriter (enhanceReflectionWithAI)
 * 2. Autopsy Chamber Coroner (getAutopsyAnalysis)
 * 3. Monthly Dossier Synthesizer
 * 4. Guardian Crisis Briefing (generateAiGuardianBriefing)
 * 
 * Multi-Tier Sovereign Cascade:
 * Tier 1: Hugging Face Sovereign ZeroGPU Space (Qwen 2.5 7B Instruct)
 * Tier 2: Cloudflare Workers AI Multi-Account Pool (Llama 3.1 8B FP8, ~2.3s, Zero-Training)
 * 
 * Strict Privacy Mandate:
 * When Sovereign AI is selected (default 'auto' or 'qwen'), user reflections
 * NEVER route to Google Gemini. Gemini is strictly an explicit user opt-in.
 */

import { fetchCloudHuggingFaceToken, fetchCloudCloudflareCredentials, fetchCloudGeminiApiKey } from './firebase';

const API_BASE = '/api';

const isStaticHost = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('pages.dev') ||
  window.location.hostname.includes('vercel.app')
);

/**
 * Direct Client-Side Cloudflare Workers AI Inference with Dual-Account Pool Support
 */
export async function callDirectCloudflareWorkersAI({
  prompt,
  systemInstruction = '',
  maxTokens = 1024,
  timeoutMs = 25000
}) {
  let cloudflareCreds = null;
  try {
    cloudflareCreds = await fetchCloudCloudflareCredentials();
  } catch (e) {}

  const accounts = [
    {
      id: cloudflareCreds?.accountId || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_ACCOUNT_ID) || null,
      token: cloudflareCreds?.apiToken || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_API_TOKEN) || null,
      label: 'Primary Account'
    },
    {
      id: cloudflareCreds?.accountId2 || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_ACCOUNT_ID_2) || null,
      token: cloudflareCreds?.apiToken2 || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_API_TOKEN_2) || null,
      label: 'Secondary Account (Pool 2)'
    }
  ].filter(acc => Boolean(acc.id && acc.token));

  if (accounts.length === 0) {
    return { ok: false, error: 'No Cloudflare credentials found in Firestore or environment' };
  }

  const model = cloudflareCreds?.model || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDFLARE_MODEL) || '@cf/meta/llama-3.1-8b-instruct-fp8';

  let lastError = null;

  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${acc.id}/ai/v1/chat/completions`;
      const messages = [];
      if (systemInstruction && systemInstruction.trim()) {
        messages.push({ role: 'system', content: systemInstruction.trim() });
      }
      messages.push({ role: 'user', content: prompt });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${acc.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: Math.min(Number(maxTokens) || 1024, 2048)
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastError = `Cloudflare HTTP ${res.status} on ${acc.label}: ${errText.slice(0, 120)}`;
        console.warn(`[Client AI Gateway] ${lastError}`);
        continue;
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text && text.trim()) {
        return {
          ok: true,
          text: text.trim(),
          model: `Cloudflare Edge (${model} - ${acc.label})`,
          provider: 'cloudflare'
        };
      }
      lastError = `Empty output from Cloudflare Workers AI (${acc.label})`;
    } catch (err) {
      lastError = err.name === 'AbortError' ? `Cloudflare request timed out (${Math.round(timeoutMs / 1000)}s) on ${acc.label}` : err.message;
      console.warn(`[Client AI Gateway] ${lastError}`);
    }
  }

  return { ok: false, error: lastError || 'All Cloudflare pool accounts exhausted' };
}

/**
 * Direct Client-Side Hugging Face Sovereign Space Inference
 */
export async function callDirectHuggingFaceSpace({
  journalInput,
  verdictName,
  customInstruction = '',
  preferredLanguage = 'auto'
}) {
  let hfToken = null;
  let spaceId = 'Trinno112/Daily-verdict';

  try {
    const cloudHf = await fetchCloudHuggingFaceToken();
    if (cloudHf?.token) {
      hfToken = cloudHf.token;
      if (cloudHf.spaceId) spaceId = cloudHf.spaceId;
    }
  } catch (e) {}

  if (!hfToken && typeof import.meta !== 'undefined' && import.meta.env) {
    hfToken = import.meta.env.VITE_HF_TOKEN || null;
  }

  if (!hfToken) {
    return { ok: false, error: 'Sovereign Qwen token is not configured' };
  }

  const cleanHost = spaceId.replace(/\//g, '-').toLowerCase();
  const spaceUrl = `https://${cleanHost}.hf.space`;
  const endpointUrl = `${spaceUrl}/gradio_api/call/enhance_diary`;

  try {
    const callRes = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        data: [journalInput, verdictName, customInstruction || '', preferredLanguage || 'auto']
      })
    });

    if (!callRes.ok) {
      return { ok: false, error: `Qwen Space endpoint HTTP ${callRes.status}` };
    }

    const callData = await callRes.json();
    if (!callData?.event_id) {
      return { ok: false, error: 'Invalid event ID from Qwen Space' };
    }

    const eventRes = await fetch(`${spaceUrl}/gradio_api/call/enhance_diary/${callData.event_id}`, {
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Accept': 'text/event-stream'
      }
    });

    if (!eventRes.ok) {
      return { ok: false, error: `Qwen Space stream HTTP ${eventRes.status}` };
    }

    const streamText = await eventRes.text();
    const lines = streamText.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const rawJson = line.slice(5).trim();
          const parsed = JSON.parse(rawJson);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.error) {
            return { ok: false, error: parsed.error };
          }
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return {
              ok: true,
              text: parsed[0],
              model: 'Qwen/Qwen2.5-7B-Instruct (ZeroGPU Space)',
              provider: 'huggingface'
            };
          }
        } catch (e) {}
      }
    }

    return { ok: false, error: 'Could not extract text from Qwen Space stream' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Dispatch Diary Reflection through Central Sovereign AI Cascade
 */
export async function dispatchEnhanceReflection({
  notes,
  rating,
  date,
  preferredLanguage = 'auto',
  spheres = null,
  customInstruction = null,
  aiEngine = 'qwen',
  cleanAiEnhancedText
}) {
  // 1. Primary Route: Express Backend Central AI Gateway (if server is up)
  if (!isStaticHost) {
    try {
      const res = await fetch(`${API_BASE}/ai/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, rating, date, preferredLanguage, spheres, customInstruction, aiEngine })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.enhancedText) {
          const cleaned = cleanAiEnhancedText ? cleanAiEnhancedText(data.enhancedText) : data.enhancedText;
          const resultStr = new String(cleaned);
          resultStr.isLocalFallback = Boolean(data.isLocalFallback);
          resultStr.fallbackReason = data.fallbackReason || null;
          resultStr.modelUsed = data.modelUsed || null;
          return resultStr;
        }
      }
    } catch (err) {
      // Backend offline or unreachable, proceed to client-side sovereign cascade
    }
  }

  // Format journal input with domain breakdown if spheres present
  let journalInput = notes || '';
  if (spheres && Object.keys(spheres).length > 0) {
    const sphereDetails = Object.entries(spheres)
      .filter(([_, s]) => s && (s.rating || (s.notes && s.notes.trim())))
      .map(([id, s]) => `[${s.name || id} — Rated ${s.rating || 'N/A'}/5]: ${s.notes || '(No notes logged)'}`)
      .join('\n\n');
    if (sphereDetails) journalInput = `${journalInput ? journalInput + '\n\n' : ''}--- Domain Breakdown ---\n${sphereDetails}`;
  }

  const verdictNames = { 1: 'Rough', 2: 'Down', 3: 'Okay', 4: 'Good', 5: 'Peak' };
  const verdictName = verdictNames[Number(rating)] || 'Down';

  // 2. Sovereign Cascade: Hugging Face Qwen -> Cloudflare Workers AI Pool
  if (aiEngine === 'qwen' || aiEngine === 'auto') {
    // Tier 1: Direct Hugging Face ZeroGPU Space
    const hfRes = await callDirectHuggingFaceSpace({
      journalInput,
      verdictName,
      customInstruction: customInstruction || '',
      preferredLanguage
    });

    if (hfRes.ok) {
      const cleaned = cleanAiEnhancedText ? cleanAiEnhancedText(hfRes.text) : hfRes.text;
      const resultStr = new String(cleaned);
      resultStr.isLocalFallback = false;
      resultStr.modelUsed = hfRes.model;
      return resultStr;
    }

    // Tier 2: Automatic Failover -> Cloudflare Workers AI Edge Pool (Zero Training)
    console.info('[Client AI Gateway] HF Space unavailable. Failing over to Cloudflare Workers AI edge pool...');
    
    let prompt = `Date: ${date}\nVerdict: ${verdictName} (${rating}/5)\nNotes: ${journalInput}`;
    if (customInstruction) prompt += `\nDirectives: ${customInstruction}`;
    prompt += '\n\nPolish this journal entry into a sharp, authentic, 1st-person reflection. Retain all factual events, feelings, and details without fluff, preamble, or markdown formatting.';

    const cfRes = await callDirectCloudflareWorkersAI({
      prompt,
      systemInstruction: 'You are a personal introspective diary ghostwriter. Return strictly the reflection in first-person without quotes, headers, or preambles.',
      maxTokens: 1536
    });

    if (cfRes.ok) {
      const cleaned = cleanAiEnhancedText ? cleanAiEnhancedText(cfRes.text) : cfRes.text;
      const resultStr = new String(cleaned);
      resultStr.isLocalFallback = false;
      resultStr.modelUsed = cfRes.model;
      return resultStr;
    }

    // Strict Data Sovereignty Mandate: Never fall back to Gemini when Sovereign is active
    throw new Error('All Sovereign AI tiers (Hugging Face & Cloudflare) unavailable. Zero Google leak preserved.');
  }

  // 3. Explicit Gemini Opt-In (Only if user intentionally configured 'gemini')
  if (aiEngine === 'gemini') {
    let apiKey = null;
    try {
      apiKey = await fetchCloudGeminiApiKey();
    } catch (e) {}

    if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
    }

    if (apiKey) {
      const prompt = `Date: ${date}\nVerdict: ${verdictName} (${rating}/5)\nNotes: ${journalInput}\n\nRewrite as a polished, thoughtful first-person diary reflection without markdown fences or headers.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          const cleaned = cleanAiEnhancedText ? cleanAiEnhancedText(text) : text.trim();
          const resultStr = new String(cleaned);
          resultStr.isLocalFallback = false;
          resultStr.modelUsed = 'Google Gemini 2.5 Flash (Explicit Opt-In)';
          return resultStr;
        }
      }
    }
  }

  throw new Error('No AI engine available.');
}
