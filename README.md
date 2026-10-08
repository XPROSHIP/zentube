# ⚡ OmniScript — YouTube AI Arama, Altyazı & Özet Platformu

Awwwards tarzı karanlık lüks tasarıma sahip, tam mobil uyumlu, YouTube'da akıllı arama yapıp altyazıları (DownSub mantığıyla) çeken ve Gemini AI ile anında özetleyen tam teşekküllü web uygulaması.

---

## 🌟 Öne Çıkan Özellikler

1. **Awwwards Stili Modern Arayüz:** Derin siyahlar, akıcı mikro etkileşimler, cam (glassmorphism) efektleri ve responsive mobil tasarım.
2. **Akıllı Sorgu Optimizasyonu (AI Query Expansion):** Uzun veya karmaşık cümleleri YouTube'un en iyi anlayacağı anahtar kelimelere dönüştürür.
3. **DownSub Mimarisi (API'siz & Limitsiz):** YouTube Data API kotasına takılmadan altyazıları doğrudan çeker. `.SRT` veya `.TXT` olarak tek tıkla indirme desteği sunar.
4. **Gemini 2.5 Flash Derin Analiz:**
   - Yönetici Özeti (Executive Summary)
   - En büyük çıkarım (Key Takeaways)
   - Temel maddeler ve konu başlıkları
   - Tıklanabilir zaman damgaları (Timeline)
5. **Alternatif Video Önerileri:** Aynı konuda ilgili diğer videoları tek tıkla analiz etme.
6. **Esnek API Yapısı:** Gemini anahtarı ister arayüzden girilebilir, ister `.env` dosyasına eklenebilir.

---

## 🚀 1. Localde (Kendi Bilgisayarınızda) Çalıştırma

Terminal veya komut satırını açın ve proje klasöründe şu komutu verin:

```bash
npm start
```

Tarayıcınızda açın:
👉 **`http://localhost:3000`**

*(İsteğe bağlı)* Kendi Gemini API anahtarınızı tanımlamak için klasördeki `.env.example` dosyasını kopyalayıp `.env` yapın ve anahtarınızı ekleyin. Veya doğrudan sitedeki **"Gemini API"** butonuna basarak tarayıcıdan girin.

---

## 🌐 2. İnternette ÜCRETSİZ ve Kolayca Yayınlama Rehberi

Bu proje Node.js backend'ine (CORS'suz YouTube ve altyazı motoru) sahip olduğu için en kolay ve ücretsiz yayınlama yöntemi **Render.com** veya **Railway.app**'tir.

### En Kolay Yol: Render.com (Ücretsiz Web Servisi)

1. **GitHub'a Yükleyin:**
   - [GitHub.com](https://github.com)'a gidin ve yeni bir repository (örneğin `youtube-omniscript`) oluşturun.
   - Proje dosyalarınızı bu repoya yükleyin (git push).

2. **Render'a Bağlayın:**
   - [render.com](https://render.com) adresine gidin ve GitHub hesabınızla ücretsiz kayıt olun/giriş yapın.
   - **"New +"** butonuna basıp **"Web Service"** seçeneğini seçin.
   - GitHub'daki deponuzu (`youtube-omniscript`) seçin.

3. **Ayarlar:**
   - **Name:** `youtube-omniscript` (veya istediğiniz bir isim)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (Ücretsiz)

4. **Ortam Değişkeni (Opsiyonel ama Tavsiye Edilir):**
   - *"Environment Variables"* sekmesinde:
     - `GEMINI_API_KEY` = `(Google AI Studio'dan aldığınız anahtar)`

5. **"Deploy Web Service"** butonuna basın!
   - 1-2 dakika içinde size `https://youtube-omniscript.onrender.com` gibi ücretsiz, güvenli (SSL'li) canlı bir web sitesi linki verir!

---

## 🔑 Ücretsiz Google Gemini API Anahtarı Nasıl Alınır?

1. [Google AI Studio](https://aistudio.google.com/app/apikey) sayfasına gidin.
2. Google hesabınızla giriş yapın.
3. **"Create API key"** butonuna tıklayın.
4. Çıkan anahtarı kopyalayıp web sitenizdeki anahtar butonuna yapıştırın.
