const express = require('express');
const ytdl = require('@distube/ytdl-core'); // Rozbudowana biblioteka do YT
const app = express();
const PORT = process.env.PORT || 3000;

// Strona główna (YouTube 2007)
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>YouTube - Broadcast Yourself. (2007)</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body bgcolor="#ffffff" text="#000000" link="#0033cc" vlink="#0033cc">
            <table width="100%" bgcolor="#e5e5e5" cellpadding="5">
                <tr>
                    <td><b><font size="4" color="#cc0000">YOU</font><font size="4">TUBE</font></b> | <a href="/">Główna</a></td>
                </tr>
            </table>
            <hr>
            <h3>Retro YouTube dla W200i / K510i</h3>
            <form action="/search" method="GET">
                <b>Szukaj:</b><br>
                <input type="text" name="q" size="15"><br>
                <input type="submit" value="Szukaj wideo">
            </form>
            <br>
            <p><b>Lub wpisz bezpośredni ID wideo:</b></p>
            <form action="/watch" method="GET">
                ID (np. dQw4w9WgXcQ):<br>
                <input type="text" name="v" size="15"><br>
                <input type="submit" value="Otwórz">
            </form>
            <hr>
            <small>Wersja zoptymalizowana pod stare przeglądarki.</small>
        </body>
        </html>
    `);
});

// Strona wyszukiwania (Używa publicznego API Invidious, żeby nie blokerowało zapytań)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
        // Pobieramy wyniki wyszukiwania z otwartej instancji Invidious
        const response = await fetch(`https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
        const videos = await response.json();

        let htmlResults = '';
        videos.slice(0, 10).forEach(vid => {
            htmlResults += `
                <tr>
                    <td valign="top">
                        <a href="/watch?v=${vid.videoId}">
                            <b>${vid.title}</b>
                        </a><br>
                        <small>Czas: ${Math.floor(vid.lengthSeconds / 60)}m ${vid.lengthSeconds % 60}s | Autor: ${vid.author}</small>
                    </td>
                </tr>
                <tr><td colspan="2"><hr></td></tr>
            `;
        });

        res.send(`
            <html>
            <head><title>Wyniki: ${query}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[< Powrót]</a>
                <h3>Wyniki dla: ${query}</h3>
                <table width="100%">
                    ${htmlResults || 'Brak wyników.'}
                </table>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Błąd wyszukiwania: ${err.message}. Spróbuj podać bezpośrednie ID filmu.`);
    }
});

// Strona odtwarzania - serwuje bezpośredni link do pliku wideo
app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.redirect('/');

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(videoUrl);
        
        // Szukamy najniższej rozdzielczości (np. 144p / 240p) z dźwiękiem i wideo w jednym strumieniu (MP4/3GP)
        const format = info.formats.find(f => f.hasVideo && f.hasAudio && f.container === 'mp4') || info.formats[0];

        res.send(`
            <html>
            <head><title>${info.videoDetails.title}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[Strona główna]</a><br><br>
                <b>${info.videoDetails.title}</b><br>
                <small>Autor: ${info.videoDetails.author.name}</small><br><br>
                
                <table bgcolor="#ffffcc" border="1" cellpadding="5">
                    <tr>
                        <td>
                            <b><a href="${format.url}">► ODTWÓRZ / POBIERZ WIDEO</a></b><br>
                            <small>Format: ${format.container || 'mp4'} (${format.qualityLabel || 'low'})</small>
                        </td>
                    </tr>
                </table>
                <br>
                <p><small>Kliknięcie "ODTWÓRZ" otworzy odtwarzacz w Twoim Sony Ericssonie.</small></p>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Błąd pobierania wideo: ${err.message}`);
    }
});

app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));