const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Lista działających publicznych instancji Invidious
const API_INSTANCES = [
    'https://invidious.nerdvpn.de',
    'https://invidious.drgns.space',
    'https://inv.tux.pizza',
    'https://invidious.no-kyc.app'
];

// Funkcja pomocnicza do pobierania danych z zapasowymi serwerami
async function fetchFromInvidious(endpoint) {
    for (const instance of API_INSTANCES) {
        try {
            const res = await fetch(`${instance}${endpoint}`);
            if (res.ok) return await res.json();
        } catch (e) {
            console.log(`Instancja ${instance} padła, próbuję następną...`);
        }
    }
    throw new Error('Wszystkie instancje API są w tej chwili niedostępne.');
}

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
            <hr>
            <small>Wersja z automatycznym przełączaniem API</small>
        </body>
        </html>
    `);
});

// Wyszukiwanie
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
        const videos = await fetchFromInvidious(`/api/v1/search?q=${encodeURIComponent(query)}&type=video`);

        let htmlResults = '';
        videos.slice(0, 10).forEach(vid => {
            htmlResults += `
                <tr>
                    <td valign="top">
                        <a href="/watch?v=${vid.videoId}">
                            <b>${vid.title}</b>
                        </a><br>
                        <small>Czas: ${Math.floor(vid.lengthSeconds / 60)}m ${vid.lengthSeconds % 60}s</small>
                    </td>
                </tr>
                <tr><td><hr></td></tr>
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
        res.send(`Błąd wyszukiwania: ${err.message}`);
    }
});

// Odtwarzacz
app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.redirect('/');

    try {
        const data = await fetchFromInvidious(`/api/v1/videos/${videoId}`);

        let streamUrl = '';
        if (data.formatStreams && data.formatStreams.length > 0) {
            streamUrl = data.formatStreams[0].url;
        } else if (data.adaptiveFormats) {
            const fmt = data.adaptiveFormats.find(f => f.container === 'mp4');
            streamUrl = fmt ? fmt.url : '';
        }

        if (!streamUrl) throw new Error('Nie znaleziono pasującego strumienia wideo.');

        res.send(`
            <html>
            <head><title>${data.title}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[Strona główna]</a><br><br>
                <b>${data.title}</b><br>
                <small>Autor: ${data.author}</small><br><br>
                
                <table bgcolor="#ffffcc" border="1" cellpadding="5">
                    <tr>
                        <td>
                            <b><a href="${streamUrl}">► ODTWÓRZ / POBIERZ WIDEO</a></b>
                        </td>
                    </tr>
                </table>
                <br>
                <p><small>Kliknij link powyżej, aby uruchomić wideo.</small></p>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Błąd ładowania wideo: ${err.message}`);
    }
});

app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));