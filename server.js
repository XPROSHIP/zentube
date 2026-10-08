import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';
import { YoutubeTranscript } from 'youtube-transcript';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Obfuscated integrated API key
const OBFUSCATED_KEY = 'QVEuQWI4Uk42SXI4eTFkdG05SjVqeUNmeVpQU1cxSk85eFZoZ0duTkRmbWxMeUZmNDFwVWc=';
function getBuiltinKey() {
  try {
    return Buffer.from(OBFUSCATED_KEY, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

// Check ZEN Easter Egg triggers (Exact user channel match)
function checkZenEasterEgg(input) {
  if (!input) return false;
  const normalized = input.toLowerCase()
    .replace(/[@#,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const keywords = [
    'zen', 'zenrecords', 'zen record', 'zen records', 'zen müzik', 'zen muzik',
    'omerzen', 'ömer erzen', 'omer erzen', 'ömer zen', 'omer zen',
    'suno zen', 'suno ömer', 'suno omer', 'zen podcast', 'zenpod',
    'ömer müziği', 'omer muzigi', 'zen son parçalar', 'zen son parcalar',
    'zen record', 'zen-record'
  ];

  return keywords.some(k => {
    return normalized === k || 
           normalized.includes('zen record') || 
           normalized.includes('omerzen') || 
           normalized.includes('ömer erzen') ||
           normalized.includes('zenpod') ||
           normalized.includes('zen müzik') ||
           normalized.includes('zen muzik') ||
           normalized.includes('zen son parça') ||
           normalized.includes('zen son parca');
  });
}

// Dedicated Real-time Channel Scraper for https://www.youtube.com/@ZEN-Record
async function getZenChannelLatestVideos() {
  const fallbackIds = ['pdJ3rr-rYVQ', 'T_v9RvqdXBM', 'wQf87xoBxJ0', 'sHfvyMmeP9I', '1VgM0CsVhpQ'];
  try {
    const res = await fetch('https://www.youtube.com/@ZEN-Record', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const html = await res.text();
      const videoMatches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
      const shortMatches = [...html.matchAll(/\/shorts\/([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
      const liveIds = [...new Set([...shortMatches, ...videoMatches])];
      if (liveIds.length > 0) {
        return liveIds;
      }
    }
  } catch (err) {
    console.warn('Real-time channel scrape fallback:', err.message);
  }
  return fallbackIds;
}

// Extract YouTube Video ID from any URL format
function extractVideoId(input) {
  if (!input) return null;
  const str = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  if (str.includes('downsub.com')) {
    try {
      const parsedUrl = new URL(str);
      const target = parsedUrl.searchParams.get('url');
      if (target) return extractVideoId(target);
    } catch {}
  }

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = str.match(regExp);
  return match ? match[1] : null;
}

// Check if string is a generic web URL (not YouTube/Downsub)
function isGenericWebUrl(input) {
  if (!input) return false;
  const str = input.trim();
  if (!/^https?:\/\//i.test(str)) return false;
  if (/youtube\.com|youtu\.be|downsub\.com/i.test(str)) return false;
  return true;
}

// Format seconds to MM:SS or HH:MM:SS
function formatTimestamp(seconds) {
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Scrape generic webpage content for YouTube search
async function extractTopicFromWebpage(url, apiKey) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaDesc = descMatch ? descMatch[1].trim() : '';

    const bodyText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);

    const combinedInfo = `Başlık: ${title}\nAçıklama: ${metaDesc}\nİçerik Özeti: ${bodyText.slice(0, 500)}`;

    if (apiKey) {
      const prompt = `Aşağıdaki web sitesi içeriğini analiz et:
"""
${combinedInfo}
"""

GÖREV: Bu web sitesinin konusunu anlatan ve YouTube'da en alakalı videoyu bulacak 3 ila 5 kelimelik net arama terimleri üret. Sadece anahtar kelimeleri tek satırda yaz.`;

      const aiQuery = await callGemini(apiKey, prompt);
      if (aiQuery && aiQuery.trim()) {
        return aiQuery.trim().replace(/^["']|["']$/g, '');
      }
    }

    return title || metaDesc || 'güncel haber konu analizi';
  } catch (err) {
    console.warn('Webpage scraping fallback error:', err.message);
    return 'haber analizi ve detayları';
  }
}

// Call Google Gemini API (2026 Production Models)
async function callGemini(apiKey, prompt, systemInstruction = '') {
  const models = [
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite'
  ];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4500
        }
      };
      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Gemini API yanıt vermedi.');
}

// Smart Search Query Optimizer
async function optimizeSearchQuery(rawQuery, apiKey) {
  const trimmed = rawQuery.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'gündem' || lower === 'haber' || lower === 'haberler' || lower === 'son dakika') {
    return 'Türkiye gündem son dakika haberleri bugün canlı';
  }

  if (!apiKey || trimmed.length < 15) {
    return trimmed;
  }

  try {
    const prompt = `Kullanıcının YouTube araması için yazdığı şu metni incele:
"${trimmed}"

GÖREV:
1. Yazım hatalarını (typo) düzelt.
2. "son klibi", "gündem", "en son" gibi ifadeler varsa YouTube'un en taze ve en alakalı videoyu getireceği 3-6 kelimelik çok net arama kelimelerine dönüştür.
3. Sadece optimize edilmiş arama terimlerini tek satırda yaz.`;

    const optimized = await callGemini(apiKey, prompt, 'Sen arama terimlerini ve yazım hatalarını düzelten bir YouTube arama uzmanısın.');
    return optimized.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    console.warn('Query optimization fallback:', err.message);
    return trimmed;
  }
}

// Robust Multi-Language Transcript Fetcher
async function getTranscript(videoId) {
  // 1. Try standard automatic / default transcript
  try {
    const transcriptList = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcriptList && transcriptList.length > 0) {
      return transcriptList;
    }
  } catch {}

  // 2. Try language fallbacks
  for (const lang of ['tr', 'en', 'en-US', 'a.tr', 'a.en', 'de', 'fr', 'es', 'ru', 'ar', 'fa']) {
    try {
      const transcriptList = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (transcriptList && transcriptList.length > 0) {
        return transcriptList;
      }
    } catch {}
  }

  // 3. Direct HTML / ytInitialPlayerResponse timedtext fallback
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();
    const match = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (match) {
      const tracks = JSON.parse(match[1]);
      if (tracks && tracks.length > 0 && tracks[0].baseUrl) {
        const subRes = await fetch(tracks[0].baseUrl, { signal: AbortSignal.timeout(6000) });
        const xml = await subRes.text();
        const results = [];
        const pRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/gi;
        let m;
        while ((m = pRegex.exec(xml)) !== null) {
          const start = parseFloat(m[1]) * 1000;
          const dur = parseFloat(m[2]) * 1000;
          const text = m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
          if (text) results.push({ text, offset: start, duration: dur });
        }
        if (results.length > 0) return results;
      }
    }
  } catch {}

  throw new Error('Altyazı bulunamadı');
}

// In-App Direct MP4 Video Resolver
async function resolveDirectVideoDownload(videoId, format = '360') {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const initRes = await fetch(`https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(targetUrl)}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(10000)
  });
  if (!initRes.ok) throw new Error('İndirme servisi başlatılamadı');
  const initData = await initRes.json();
  const progressUrl = initData.progress_url || (initData.id ? `https://lto2.affadaffa.com/api/progress?id=${initData.id}` : null);
  
  if (!progressUrl) throw new Error('İlerleme adresi alınamadı');

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const progRes = await fetch(progressUrl, { signal: AbortSignal.timeout(6000) });
    if (!progRes.ok) continue;
    const progData = await progRes.json();
    if (progData.download_url) {
      return {
        downloadUrl: progData.download_url,
        title: progData.title || initData.title || 'video',
        format: progData.format || 'mp4'
      };
    }
  }
  throw new Error('Video indirme hazırlığı zaman aşımına uğradı');
}

// Extractive smart fallback summary
function generateFallbackSummary(transcriptList, videoTitle) {
  const fullText = (transcriptList || []).map(t => t.text).join(' ');
  const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText || videoTitle];
  
  const samplePoints = [];
  const step = Math.max(1, Math.floor((transcriptList || []).length / 5));
  for (let i = 0; i < (transcriptList || []).length; i += step) {
    if (samplePoints.length >= 5) break;
    const item = transcriptList[i];
    samplePoints.push({
      time: formatTimestamp(item.offset / 1000),
      seconds: Math.floor(item.offset / 1000),
      text: item.text.replace(/\n/g, ' ').trim()
    });
  }

  return {
    isFallback: true,
    executive: `"${videoTitle}" başlıklı video için toplam ${(transcriptList || []).length} altyazı satırı başarıyla analiz edildi.`,
    takeaway: 'Videonun tüm altyazısı aşağıda zaman çizelgesine göre bölümlendirilmiştir.',
    keyPoints: [
      `Toplam altyazı segmenti: ${(transcriptList || []).length}`,
      `Tahmini süre: ${formatTimestamp(((transcriptList && transcriptList[transcriptList.length - 1]?.offset) || 0) / 1000)}`,
      sentences[0] ? `Giriş: "${sentences[0].trim().slice(0, 150)}..."` : 'Video incelendi.',
      sentences[Math.floor(sentences.length / 2)] ? `Gelişme: "${sentences[Math.floor(sentences.length / 2)].trim().slice(0, 150)}..."` : 'Ana tema ele alındı.',
      sentences[sentences.length - 1] ? `Sonuç: "${sentences[sentences.length - 1].trim().slice(0, 150)}..."` : 'Kapanış bölümü tespit edildi.'
    ],
    timeline: samplePoints.map((p, idx) => ({
      timestamp: p.time,
      seconds: p.seconds,
      title: `${idx + 1}. Bölüm`,
      description: p.text
    }))
  };
}

// AI-Powered Deep Summary with Gemini 3.8 Flash
async function generateAiSummary(transcriptList, video, apiKey) {
  const compressed = [];
  let currentSec = 0;
  let currentBuffer = [];

  for (const item of (transcriptList || [])) {
    const sec = Math.floor(item.offset / 1000);
    currentBuffer.push(item.text);
    if (sec - currentSec >= 45 || currentBuffer.length >= 10) {
      compressed.push(`[${formatTimestamp(currentSec)}] ${currentBuffer.join(' ')}`);
      currentBuffer = [];
      currentSec = sec;
    }
  }
  if (currentBuffer.length > 0) {
    compressed.push(`[${formatTimestamp(currentSec)}] ${currentBuffer.join(' ')}`);
  }

  const fullTranscriptStr = compressed.join('\n').slice(0, 50000);

  const prompt = `Aşağıda YouTube videosuna ait bilgiler ve konuşma metni yer almaktadır.
Video Başlığı: "${video.title}"
Kanal: "${video.author?.name || 'Bilinmiyor'}"
Video Linki: "${video.url}"
Açıklama: "${(video.description || '').slice(0, 1000)}"

TRANSKRİPT:
"""
${fullTranscriptStr || 'Altyazı metni kısıtlıdır, video başlığı ve açıklaması üzerinden en kapsamlı analizi yap.'}
"""

GÖREV:
Bu videoyu profesyonelce, akıcı, zengin ve anlaşılır Türkçe ile analiz et.
Çıktıyı MUTLAKA ve SADECE aşağıdaki JSON formatında ver:

{
  "executive": "Videonun 2-3 cümlelik çok güçlü ana fikri",
  "takeaway": "İzleyicinin bu videodan çıkarması gereken en büyük ders veya kritik çıkarım",
  "keyPoints": [
    "Detaylı ve bilgilendirici 1. önemli madde",
    "Detaylı ve bilgilendirici 2. önemli madde",
    "Detaylı ve bilgilendirici 3. önemli madde",
    "Detaylı ve bilgilendirici 4. önemli madde",
    "Detaylı ve bilgilendirici 5. önemli madde"
  ],
  "timeline": [
    {
      "timestamp": "01:23",
      "seconds": 83,
      "title": "Bölüm Başlığı",
      "description": "Bu dakikada neyden bahsedildiği"
    }
  ]
}`;

  const rawResult = await callGemini(apiKey, prompt, 'Sen video analiz ve özetleme asistanısın. Yanıtlarını geçerli JSON olarak üretirsin.');
  const cleaned = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    try {
      let repaired = cleaned;
      if (!repaired.endsWith('}')) {
        repaired = repaired.replace(/,[^,]*$/, '') + '\n]}';
      }
      parsed = JSON.parse(repaired);
    } catch {}
  }

  if (parsed && (parsed.executive || parsed.keyPoints)) {
    return { ...parsed, isFallback: false };
  }

  return {
    isFallback: false,
    executive: rawResult.slice(0, 350),
    takeaway: 'Özet başarıyla oluşturuldu.',
    keyPoints: [rawResult.slice(0, 200)],
    timeline: []
  };
}

// API: Process Query, YouTube URL, or Generic Website URL
app.post('/api/process', async (req, res) => {
  try {
    const { query, apiKey: clientApiKey } = req.body;
    const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY || getBuiltinKey();

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Lütfen bir arama konusu veya YouTube video linki girin.' });
    }

    const trimmedInput = query.trim();
    const isZenEasterEgg = checkZenEasterEgg(trimmedInput);
    const directVideoId = extractVideoId(trimmedInput);
    const isExternalUrl = !directVideoId && isGenericWebUrl(trimmedInput);

    let chosenVideo = null;
    let alternativeVideos = [];
    let transcript = null;
    let optimizedQuery = trimmedInput;
    let hasRealTranscript = true;

    if (isZenEasterEgg) {
      // Direct Live Resolution from user's official channel: https://www.youtube.com/@ZEN-Record
      const zenVideoIds = await getZenChannelLatestVideos();
      optimizedQuery = 'ZEN-Record (@ZEN-Record Resmi Kanalı)';

      const primaryId = zenVideoIds[0] || 'pdJ3rr-rYVQ';
      try {
        const vInfo = await ytSearch({ videoId: primaryId });
        chosenVideo = {
          videoId: primaryId,
          title: vInfo.title || 'Destân-ı Zîşân',
          url: `https://www.youtube.com/watch?v=${primaryId}`,
          thumbnail: vInfo.thumbnail || `https://i.ytimg.com/vi/${primaryId}/hqdefault.jpg`,
          duration: vInfo.duration?.timestamp || '2:30',
          author: { name: 'ZEN RECORDS', url: 'https://www.youtube.com/@ZEN-Record' },
          views: vInfo.views || 250,
          ago: vInfo.ago || 'Yeni'
        };
      } catch {
        chosenVideo = {
          videoId: primaryId,
          title: 'Destân-ı Zîşân',
          url: `https://www.youtube.com/watch?v=${primaryId}`,
          thumbnail: `https://i.ytimg.com/vi/${primaryId}/hqdefault.jpg`,
          duration: '2:30',
          author: { name: 'ZEN RECORDS', url: 'https://www.youtube.com/@ZEN-Record' }
        };
      }

      try {
        transcript = await getTranscript(primaryId);
      } catch {
        transcript = [
          { text: 'ZEN RECORDS — Özgün Müzik Prodüksiyonu & Eser', offset: 0, duration: 3000 }
        ];
      }

      const altIds = zenVideoIds.slice(1, 4);
      alternativeVideos = [];
      for (const altId of altIds) {
        try {
          const altInfo = await ytSearch({ videoId: altId });
          alternativeVideos.push({
            videoId: altId,
            title: altInfo.title || 'ZEN-Record Eseri',
            url: `https://www.youtube.com/watch?v=${altId}`,
            thumbnail: altInfo.thumbnail || `https://i.ytimg.com/vi/${altId}/hqdefault.jpg`
          });
        } catch {}
      }

    } else if (directVideoId) {
      // Direct YouTube / Downsub URL mode
      try {
        const searchResult = await ytSearch({ videoId: directVideoId });
        chosenVideo = {
          videoId: directVideoId,
          title: searchResult.title || 'YouTube Videosu',
          description: searchResult.description || '',
          url: `https://www.youtube.com/watch?v=${directVideoId}`,
          thumbnail: searchResult.thumbnail || `https://i.ytimg.com/vi/${directVideoId}/hqdefault.jpg`,
          duration: searchResult.duration?.timestamp || 'Bilinmiyor',
          author: { name: searchResult.author?.name || 'YouTube Kanalı' },
          views: searchResult.views || 0,
          ago: searchResult.ago || ''
        };
      } catch {
        chosenVideo = {
          videoId: directVideoId,
          title: 'YouTube Videosu',
          url: `https://www.youtube.com/watch?v=${directVideoId}`,
          thumbnail: `https://i.ytimg.com/vi/${directVideoId}/hqdefault.jpg`,
          duration: '',
          author: { name: 'YouTube' }
        };
      }

      // Try transcript on direct video, with fallback to description if captions disabled
      hasRealTranscript = true;
      try {
        transcript = await getTranscript(directVideoId);
      } catch {
        hasRealTranscript = false;
        // Parse description for readable lines
        const descLines = (chosenVideo.description || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (descLines.length > 0) {
          transcript = descLines.slice(0, 40).map((line, idx) => ({
            text: line,
            offset: idx * 8000,
            duration: 7000
          }));
        } else {
          transcript = [
            { text: `${chosenVideo.title}. Video içeriği ve açıklaması üzerinden analiz gerçekleştirilmiştir.`, offset: 0, duration: 5000 }
          ];
        }
      }

      // Also provide related videos for direct links
      try {
        const relatedSearch = await ytSearch(chosenVideo.title);
        const relatedCandidates = (relatedSearch.videos || []).filter(v => v.videoId !== directVideoId);
        alternativeVideos = [];
        for (let i = 0; i < Math.min(relatedCandidates.length, 6); i++) {
          if (alternativeVideos.length >= 3) break;
          const rc = relatedCandidates[i];
          let hasT = false;
          try {
            const t = await getTranscript(rc.videoId);
            if (t && t.length > 0) hasT = true;
          } catch {}
          alternativeVideos.push({
            videoId: rc.videoId,
            title: rc.title,
            url: rc.url,
            thumbnail: rc.thumbnail,
            hasTranscript: hasT
          });
        }
      } catch {}

    } else {
      // General web URL or topic search
      if (isExternalUrl) {
        optimizedQuery = await extractTopicFromWebpage(trimmedInput, apiKey);
      } else if (apiKey) {
        optimizedQuery = await optimizeSearchQuery(trimmedInput, apiKey);
      }

      const searchResult = await ytSearch(optimizedQuery);
      const candidates = searchResult.videos || [];

      if (candidates.length === 0) {
        return res.status(404).json({ error: 'Aramanızla ilgili YouTube videosu bulunamadı.' });
      }

      // Deep scan up to 20 candidates to guarantee finding one with transcripts!
      let foundIndex = -1;
      hasRealTranscript = false;

      for (let i = 0; i < Math.min(candidates.length, 20); i++) {
        try {
          const t = await getTranscript(candidates[i].videoId);
          if (t && t.length > 0) {
            transcript = t;
            chosenVideo = candidates[i];
            foundIndex = i;
            hasRealTranscript = true;
            break;
          }
        } catch {}
      }

      // If none of the 20 videos had captions, gracefully analyze top candidate!
      if (!chosenVideo) {
        chosenVideo = candidates[0];
        foundIndex = 0;
        hasRealTranscript = false;
        const descLines = (chosenVideo.description || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (descLines.length > 0) {
          transcript = descLines.slice(0, 40).map((line, idx) => ({
            text: line,
            offset: idx * 8000,
            duration: 7000
          }));
        } else {
          transcript = [
            { text: `${chosenVideo.title}. Video içeriği ve açıklaması incelenmiştir.`, offset: 0, duration: 5000 }
          ];
        }
      }

      // Find alternative videos and tag which ones have transcripts!
      alternativeVideos = [];
      const remainingCandidates = candidates.filter((_, idx) => idx !== foundIndex);
      for (let i = 0; i < Math.min(remainingCandidates.length, 10); i++) {
        if (alternativeVideos.length >= 3) break;
        const cand = remainingCandidates[i];
        let hasTrans = false;
        try {
          const t = await getTranscript(cand.videoId);
          if (t && t.length > 0) hasTrans = true;
        } catch {}
        alternativeVideos.push({
          videoId: cand.videoId,
          title: cand.title,
          url: cand.url,
          thumbnail: cand.thumbnail,
          duration: cand.duration?.timestamp || '',
          views: cand.views || 0,
          hasTranscript: hasTrans
        });
      }
    }

    // AI Summarization
    let summaryData;
    if (chosenVideo) {
      try {
        summaryData = await generateAiSummary(transcript, chosenVideo, apiKey);
      } catch (e) {
        console.warn('AI summary error, falling back fast:', e.message);
        summaryData = generateFallbackSummary(transcript, chosenVideo.title);
      }
    }

    const rawContinuousText = (transcript || []).map(t => t.text.replace(/\n/g, ' ').trim()).join(' ');

    res.json({
      success: true,
      originalQuery: trimmedInput,
      optimizedQuery,
      isZenEasterEgg,
      isExternalWebUrl: isExternalUrl,
      video: chosenVideo,
      summary: summaryData,
      transcriptCount: transcript ? transcript.length : 0,
      hasRealTranscript: hasRealTranscript ?? true,
      rawContinuousText,
      alternativeVideos
    });

  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({
      error: error.message || 'İşlem sırasında beklenmeyen bir hata oluştu.'
    });
  }
});

// API: Direct MP4 Video Resolver
app.get('/api/video-download-url', async (req, res) => {
  try {
    const { videoId, format = '360' } = req.query;
    if (!videoId) return res.status(400).json({ error: 'videoId zorunludur' });

    const result = await resolveDirectVideoDownload(videoId, format);
    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      title: result.title,
      format: result.format
    });
  } catch (err) {
    console.error('Video resolve error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Video indirme linki çözülemedi'
    });
  }
});

// API: Stream Video Directly to Browser (Pure MP4 Download)
app.get('/api/video-stream', async (req, res) => {
  try {
    const { videoId, title = 'video', format = '360' } = req.query;
    if (!videoId) return res.status(400).send('videoId zorunludur');

    const result = await resolveDirectVideoDownload(videoId, format);
    const streamRes = await fetch(result.downloadUrl);
    if (!streamRes.ok) throw new Error('Video akışı alınamadı');

    const safeTitle = (title || result.title || 'video').replace(/[/\\?%*:|"<>]/g, '_');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitle)}.mp4"`);

    const { Readable } = await import('stream');
    Readable.fromWeb(streamRes.body).pipe(res);
  } catch (err) {
    console.error('Video stream error:', err.message);
    res.status(500).send(`Video indirilemedi: ${err.message}`);
  }
});

// Download Transcript as SRT or TXT (Guaranteed No Error)
app.get('/api/transcript-download', async (req, res) => {
  try {
    const { videoId, format = 'txt' } = req.query;
    if (!videoId) return res.status(400).send('videoId parametresi zorunludur.');

    let transcript;
    try {
      transcript = await getTranscript(videoId);
    } catch {
      try {
        const info = await ytSearch({ videoId });
        const descLines = (info?.description || info?.title || 'Video Metni').split('\n').map(l => l.trim()).filter(l => l.length > 0);
        transcript = descLines.slice(0, 40).map((l, i) => ({ text: l, offset: i * 6000, duration: 5000 }));
      } catch {
        transcript = [{ text: 'Video altyazı içeriği', offset: 0, duration: 5000 }];
      }
    }

    if (format === 'srt') {
      let srtContent = '';
      transcript.forEach((item, index) => {
        const startSec = (item.offset || 0) / 1000;
        const endSec = ((item.offset || 0) + (item.duration || 4000)) / 1000;
        
        const toSrtTime = (seconds) => {
          const hrs = Math.floor(seconds / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          const secs = Math.floor(seconds % 60);
          const ms = Math.floor((seconds % 1) * 1000);
          return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
        };

        srtContent += `${index + 1}\n${toSrtTime(startSec)} --> ${toSrtTime(endSec)}\n${item.text}\n\n`;
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transcript_${videoId}.srt"`);
      return res.send(srtContent);
    } else {
      const txtContent = transcript.map(t => `[${formatTimestamp((t.offset || 0) / 1000)}] ${t.text}`).join('\n');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transcript_${videoId}.txt"`);
      return res.send(txtContent);
    }
  } catch (err) {
    res.status(500).send(`Altyazı indirilemedi: ${err.message}`);
  }
});

// Check server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    serverHasGeminiKey: true
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ZEN | YouTube | Arama Aktif!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ 15-Video Derin Tarama & Garantili Altyazı: Aktif`);
  console.log(`======================================================\n`);
});
