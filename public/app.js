// ==========================================================================
// ZEN | YouTube | Arama — FRONTEND LOGIC & AI WORKFLOW
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const currentDateBadge = document.getElementById('currentDateBadge');
  const typewriterText = document.getElementById('typewriterText');
  const searchForm = document.getElementById('searchForm');
  const queryInput = document.getElementById('queryInput');
  const clearBtn = document.getElementById('clearBtn');
  const submitBtn = document.getElementById('submitBtn');
  const chips = document.querySelectorAll('.chip');
  
  const loadingSection = document.getElementById('loadingSection');
  const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4')
  ];

  const errorCard = document.getElementById('errorCard');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const closeErrorBtn = document.getElementById('closeErrorBtn');

  // Easter Egg Elements
  const zenEasterEggCard = document.getElementById('zenEasterEggCard');
  const closeZenEggBtn = document.getElementById('closeZenEggBtn');

  const resultSection = document.getElementById('resultSection');
  const queryOptimizationPill = document.getElementById('queryOptimizationPill');
  const optimizedQueryText = document.getElementById('optimizedQueryText');

  // Video Info Elements
  const videoThumb = document.getElementById('videoThumb');
  const videoDuration = document.getElementById('videoDuration');
  const videoDirectLink = document.getElementById('videoDirectLink');
  const videoTitle = document.getElementById('videoTitle');
  const videoAuthor = document.getElementById('videoAuthor');
  const videoViews = document.getElementById('videoViews');
  const transcriptLines = document.getElementById('transcriptLines');
  const downloadSrtBtn = document.getElementById('downloadSrtBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const watchOnYoutubeBtn = document.getElementById('watchOnYoutubeBtn');

  // Raw Text Toggle ("Metni Oku")
  const toggleRawTextBtn = document.getElementById('toggleRawTextBtn');
  const rawTextContainer = document.getElementById('rawTextContainer');
  const rawTextContent = document.getElementById('rawTextContent');
  const copyRawBtn = document.getElementById('copyRawBtn');

  // Alternative Videos
  const altVideosCard = document.getElementById('altVideosCard');
  const altVideosList = document.getElementById('altVideosList');

  // Summary Elements
  const summaryExecutive = document.getElementById('summaryExecutive');
  const takeawayBox = document.getElementById('takeawayBox');
  const summaryTakeaway = document.getElementById('summaryTakeaway');
  const summaryKeyPoints = document.getElementById('summaryKeyPoints');
  const timelineSection = document.getElementById('timelineSection');
  const summaryTimeline = document.getElementById('summaryTimeline');
  const copySummaryBtn = document.getElementById('copySummaryBtn');
  const downloadSummaryMdBtn = document.getElementById('downloadSummaryMdBtn');

  // API Key Modal Elements
  const apiKeyBtn = document.getElementById('apiKeyBtn');
  const apiModal = document.getElementById('apiModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleApiVisibility = document.getElementById('toggleApiVisibility');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const clearKeyBtn = document.getElementById('clearKeyBtn');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  let currentData = null;

  // ---------------- 1. Daktilo (Typewriter) Efekti ----------------
  const phrases = [
    "İzlemeye Vaktin Yok mu?",
    "Yapay Zeka Senin İçin Anlasın.",
    "Tek Tıkla Altyazıyı Çöz.",
    "Saniyeler İçinde Özetle."
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 90;

  function runTypewriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      typeSpeed = 45;
    } else {
      charIndex++;
      typeSpeed = 85;
    }

    typewriterText.textContent = currentPhrase.substring(0, charIndex);

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Kelime bittiğinde durakla
      typeSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Silme bittiğinde sıradaki cümleye geç
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(runTypewriter, typeSpeed);
  }

  runTypewriter();

  // ---------------- 2. Dinamik Tarih (1 Ocak 2020 Pazartesi formatında) ----------------
  function initDynamicDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
    if (currentDateBadge) {
      currentDateBadge.textContent = formattedDate;
    }
  }
  initDynamicDate();

  // ---------------- 3. Sonuç Gelince Çalacak Sesler ----------------
  function playSuccessSound(isEasterEgg = false) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (isEasterEgg) {
        // Triumphant VIP fanfare chime for ZEN-Record
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + (idx * 0.1);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.14, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.45);
        });
      } else {
        // Crystal notification chime
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(698.46, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);
        gain2.gain.setValueAtTime(0.09, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.45);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // ---------------- 4. API Key Yönetimi ----------------
  function getClientApiKey() {
    return localStorage.getItem('gemini_api_key') || '';
  }

  apiKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = getClientApiKey();
    apiModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    apiModal.classList.add('hidden');
  });

  apiModal.addEventListener('click', (e) => {
    if (e.target === apiModal) {
      apiModal.classList.add('hidden');
    }
  });

  toggleApiVisibility.addEventListener('click', () => {
    const isPass = apiKeyInput.type === 'password';
    apiKeyInput.type = isPass ? 'text' : 'password';
    toggleApiVisibility.innerHTML = isPass ? '<i class="ri-eye-off-line"></i>' : '<i class="ri-eye-line"></i>';
  });

  saveKeyBtn.addEventListener('click', () => {
    const val = apiKeyInput.value.trim();
    if (val) {
      localStorage.setItem('gemini_api_key', val);
      showToast('Özel API anahtarı kaydedildi!');
    } else {
      localStorage.removeItem('gemini_api_key');
      showToast('Varsayılan entegre API aktif edildi.');
    }
    apiModal.classList.add('hidden');
  });

  clearKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('gemini_api_key');
    apiKeyInput.value = '';
    showToast('Varsayılan entegre API aktif edildi.');
    apiModal.classList.add('hidden');
  });

  // ---------------- 5. Textarea ve Arama Olayları ----------------
  queryInput.addEventListener('input', () => {
    queryInput.style.height = 'auto';
    queryInput.style.height = Math.min(queryInput.scrollHeight, 140) + 'px';
    if (queryInput.value.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  });

  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      searchForm.dispatchEvent(new Event('submit'));
    }
  });

  clearBtn.addEventListener('click', () => {
    queryInput.value = '';
    queryInput.style.height = 'auto';
    clearBtn.classList.add('hidden');
    queryInput.focus();
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      queryInput.value = chip.dataset.query;
      queryInput.dispatchEvent(new Event('input'));
      searchForm.dispatchEvent(new Event('submit'));
    });
  });

  // ---------------- 6. Metni Oku (Açılır / Kapanır Accordion) ----------------
  toggleRawTextBtn.addEventListener('click', () => {
    const isHidden = rawTextContainer.classList.contains('hidden');
    if (isHidden) {
      rawTextContainer.classList.remove('hidden');
      toggleRawTextBtn.classList.add('active');
    } else {
      rawTextContainer.classList.add('hidden');
      toggleRawTextBtn.classList.remove('active');
    }
  });

  copyRawBtn.addEventListener('click', () => {
    if (!currentData || !currentData.rawContinuousText) return;
    navigator.clipboard.writeText(currentData.rawContinuousText).then(() => {
      showToast('Ham metin panoya kopyalandı!');
    });
  });

  // Easter Egg Card Close
  if (closeZenEggBtn) {
    closeZenEggBtn.addEventListener('click', () => {
      zenEasterEggCard.classList.add('hidden');
    });
  }

  // ---------------- 7. Error & Toast ----------------
  function showError(title, msg) {
    errorTitle.textContent = title;
    errorMessage.textContent = msg;
    errorCard.classList.remove('hidden');
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorCard.classList.add('hidden');
  }

  closeErrorBtn.addEventListener('click', hideError);

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // ---------------- 8. Stepper Animasyonu ----------------
  let stepInterval = null;
  function startStepper() {
    steps.forEach((s, i) => {
      s.className = 'step-item';
      if (i === 0) s.classList.add('active');
    });

    let currentStep = 0;
    stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        steps[currentStep].classList.remove('active');
        steps[currentStep].classList.add('completed');
        currentStep++;
        steps[currentStep].classList.add('active');
      }
    }, 900);
  }

  function stopStepper() {
    if (stepInterval) clearInterval(stepInterval);
  }

  // ---------------- 9. Form Gönderimi ----------------
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    hideError();
    resultSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    submitBtn.disabled = true;
    startStepper();

    try {
      const apiKey = getClientApiKey();
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, apiKey })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'İşlem sırasında bir hata oluştu.');
      }

      currentData = data;
      renderResults(data);

      // Easter Egg & Ses Çalma
      if (data.isZenEasterEgg) {
        document.body.classList.add('zen-special-theme');
        zenEasterEggCard.classList.remove('hidden');
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#38bdf8']
          });
        }
        playSuccessSound(true);
      } else {
        playSuccessSound(false);
      }

    } catch (err) {
      showError('İşlem Başarısız Oldu', err.message);
    } finally {
      stopStepper();
      loadingSection.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });

  // ---------------- 10. Sonuçları Ekrana Basma ----------------
  function renderResults(data) {
    const { video, summary, optimizedQuery, originalQuery, transcriptCount, rawContinuousText, alternativeVideos, isExternalWebUrl } = data;

    // 1. Optimize veya web'den tespit edilen sorgu banner'ı
    if (isExternalWebUrl) {
      optimizedQueryText.textContent = `Web Sayfasından Çıkarılan Konu: "${optimizedQuery}"`;
      queryOptimizationPill.classList.remove('hidden');
    } else if (optimizedQuery && optimizedQuery.toLowerCase() !== originalQuery.toLowerCase()) {
      optimizedQueryText.textContent = `"${optimizedQuery}"`;
      queryOptimizationPill.classList.remove('hidden');
    } else {
      queryOptimizationPill.classList.add('hidden');
    }

    // 2. Video Kartı
    videoThumb.src = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
    videoDuration.textContent = video.duration || 'Video';
    videoDirectLink.href = video.url;
    videoTitle.textContent = video.title;
    videoAuthor.textContent = video.author?.name || 'YouTube';
    videoViews.textContent = video.views ? Number(video.views).toLocaleString('tr-TR') : '10K+';
    transcriptLines.textContent = transcriptCount || '100+';

    // Linkler
    watchOnYoutubeBtn.href = video.url;
    downloadSrtBtn.href = `/api/transcript-download?videoId=${video.videoId}&format=srt`;
    downloadTxtBtn.href = `/api/transcript-download?videoId=${video.videoId}&format=txt`;

    // Ham Metin (Metni Oku)
    rawTextContent.textContent = rawContinuousText || 'Altyazı metni yüklenemedi.';
    rawTextContainer.classList.add('hidden');
    toggleRawTextBtn.classList.remove('active');

    // 3. Yönetici Özeti
    summaryExecutive.textContent = summary.executive || 'Özet oluşturuldu.';

    // 4. Çıkarım
    if (summary.takeaway) {
      summaryTakeaway.textContent = `"${summary.takeaway}"`;
      takeawayBox.classList.remove('hidden');
    } else {
      takeawayBox.classList.add('hidden');
    }

    // 5. Maddeler
    summaryKeyPoints.innerHTML = '';
    (summary.keyPoints || []).forEach(pt => {
      const li = document.createElement('li');
      li.textContent = pt;
      summaryKeyPoints.appendChild(li);
    });

    // 6. Zaman Çizelgesi
    summaryTimeline.innerHTML = '';
    if (summary.timeline && summary.timeline.length > 0) {
      timelineSection.classList.remove('hidden');
      summary.timeline.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        
        const targetUrl = item.seconds 
          ? `${video.url}&t=${item.seconds}s`
          : video.url;

        div.innerHTML = `
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="time-chip" title="Bu saniyeden başlat">
            <i class="ri-play-fill"></i> ${item.timestamp || '00:00'}
          </a>
          <div class="timeline-content">
            <div class="timeline-title">${item.title || 'Önemli Bölüm'}</div>
            <div class="timeline-desc">${item.description || ''}</div>
          </div>
        `;
        summaryTimeline.appendChild(div);
      });
    } else {
      timelineSection.classList.add('hidden');
    }

    // 7. Alternatif Videolar (İzle / Ara Dropdown Mekanizması)
    altVideosList.innerHTML = '';
    if (alternativeVideos && alternativeVideos.length > 0) {
      altVideosCard.classList.remove('hidden');
      alternativeVideos.forEach(alt => {
        const container = document.createElement('div');
        container.className = 'alt-video-container';

        const itemBtn = document.createElement('button');
        itemBtn.type = 'button';
        itemBtn.className = 'alt-video-item';
        itemBtn.innerHTML = `
          <img src="${alt.thumbnail}" alt="" class="alt-thumb">
          <div class="alt-info">
            <div class="alt-title">${alt.title}</div>
          </div>
          <div class="alt-menu-trigger"><i class="ri-more-2-fill"></i></div>
        `;

        // Mini Dropdown: İzle vs Ara
        const dropdown = document.createElement('div');
        dropdown.className = 'alt-action-dropdown hidden';
        dropdown.innerHTML = `
          <button type="button" class="dropdown-action-btn watch">
            <i class="ri-external-link-line"></i> İzle
          </button>
          <button type="button" class="dropdown-action-btn search">
            <i class="ri-sparkle-fill"></i> Ara & Özetle
          </button>
        `;

        // Tıklayınca hemen aramaya geçmesin, dropdown açılsın/kapansın
        itemBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Diğer açık dropdownları kapat
          document.querySelectorAll('.alt-action-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.add('hidden');
          });
          document.querySelectorAll('.alt-video-item').forEach(b => {
            if (b !== itemBtn) b.classList.remove('active');
          });

          dropdown.classList.toggle('hidden');
          itemBtn.classList.toggle('active');
        });

        // "İzle" butonu: Ekrandaki verileri silmeden yeni YouTube sekmesinde açar
        const watchBtn = dropdown.querySelector('.watch');
        watchBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(alt.url, '_blank');
          dropdown.classList.add('hidden');
          itemBtn.classList.remove('active');
        });

        // "Ara & Özetle" butonu: O videoyu analiz eder
        const searchBtn = dropdown.querySelector('.search');
        searchBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.add('hidden');
          itemBtn.classList.remove('active');
          queryInput.value = alt.url;
          queryInput.dispatchEvent(new Event('input'));
          searchForm.dispatchEvent(new Event('submit'));
        });

        container.appendChild(itemBtn);
        container.appendChild(dropdown);
        altVideosList.appendChild(container);
      });
    } else {
      altVideosCard.classList.add('hidden');
    }

    // Göster ve yukarı kaydır
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Sayfa boşluğuna tıklayınca açık olan dropdownları kapat
  document.addEventListener('click', () => {
    document.querySelectorAll('.alt-action-dropdown').forEach(d => d.classList.add('hidden'));
    document.querySelectorAll('.alt-video-item').forEach(b => b.classList.remove('active'));
  });

  // ---------------- 11. Kopyalama & Markdown Dışa Aktarım ----------------
  copySummaryBtn.addEventListener('click', () => {
    if (!currentData) return;
    const { video, summary } = currentData;
    const textToCopy = `📌 ${video.title} - Video Özeti\nKaynak: ${video.url}\n\n` +
      `⚡ Yönetici Özeti:\n${summary.executive}\n\n` +
      (summary.takeaway ? `💡 En Büyük Çıkarım:\n${summary.takeaway}\n\n` : '') +
      `✦ Önemli Maddeler:\n` + (summary.keyPoints || []).map(p => `• ${p}`).join('\n') +
      (summary.timeline?.length ? `\n\n⏱️ Zaman Damgaları:\n` + summary.timeline.map(t => `[${t.timestamp}] ${t.title}: ${t.description}`).join('\n') : '');

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Özet panoya kopyalandı!');
    }).catch(() => {
      showToast('Kopyalama başarısız oldu.');
    });
  });

  downloadSummaryMdBtn.addEventListener('click', () => {
    if (!currentData) return;
    const { video, summary } = currentData;
    const mdContent = `# ${video.title}\n\n` +
      `- **Kanal:** ${video.author?.name || 'YouTube'}\n` +
      `- **Kaynak Link:** [${video.url}](${video.url})\n` +
      `- **Süre:** ${video.duration || 'Belirtilmedi'}\n\n` +
      `## ⚡ Yönetici Özeti\n${summary.executive}\n\n` +
      (summary.takeaway ? `> 💡 **En Büyük Çıkarım:** ${summary.takeaway}\n\n` : '') +
      `## 📌 Önemli Maddeler\n` + (summary.keyPoints || []).map(p => `- ${p}`).join('\n') + `\n\n` +
      (summary.timeline?.length ? `## ⏱️ Zaman Damgaları\n` + summary.timeline.map(t => `- **[${t.timestamp}](${video.url}&t=${t.seconds}s)** ${t.title}: ${t.description}`).join('\n') : '');

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ozet_${video.videoId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Markdown dosyası indirildi!');
  });

});
