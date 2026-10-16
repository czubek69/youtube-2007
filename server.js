const express = require('express');
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
            <hr>
            <small>Wersja stabilna (Invidious Proxy)</small>
        </body>
        </html>
    `);
});

// Wyszukiwanie przez Invidious API
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
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

// Odtwarzacz korzystający ze strumieni zastępczych (omija błąd bota)
app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.redirect('/');

    try {
        // Pobieramy szczegóły o filmie z Invidious
        const response = await fetch(`https://inv.tux.pizza/api/v1/videos/${videoId}`);
        const data = await response.json();

        // Szukamy formatu wideo przyjaznego dla telefonów (np. mp4 w niskiej jakości)
        let streamUrl = '';
        if (data.adaptiveFormats) {
            const fmt = data.adaptiveFormats.find(f => f.container === 'mp4' && f.resolution === '140p') || data.formatStreams[0];
            streamUrl = fmt ? fmt.url : data.formatStreams[0].url;
        } else {
            streamUrl = data.formatStreams[0].url;
        }

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
                <p><small>Kliknij link powyżej, aby uruchomić wideo w telefonie.</small></p>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Błąd ładowania wideo: ${err.message}`);
    }
});

app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));