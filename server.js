const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Stabilne instancje API omijające blokady
const PIPED_APIS = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
    'https://pipedapi.mha.fi'
];

async function searchPiped(query) {
    for (const api of PIPED_APIS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`${api}/search?q=${encodeURIComponent(query)}&filter=videos`, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                return data.items || [];
            }
        } catch (e) {
            console.log(`Próba z ${api} nieudana, szukam dalej...`);
        }
    }
    return [];
}

// Baza filmow - Immortal Majonez Life (na stronie głównej)
const MAJONEZ_VIDEOS = [
    { id: '9NSLocUJn4s', title: 'immortal_majonez_1', duration: '0:09', author: 'Czubek10' },
    { id: 'cdcjW3py9XY', title: 'immortal_majonez_2', duration: '0:22', author: 'Czubek10' },
    { id: 'cW50zi3iqoQ', title: 'immortal_majonez_3', duration: '0:15', author: 'Czubek10' },
    { id: '7OiBxQOjmKk', title: 'end_of_immortal_majonez (BAD ENDING)', duration: '0:19', author: 'Czubek10' }
];

// Strona główna
app.get('/', (req, res) => {
    let listHtml = '';
    MAJONEZ_VIDEOS.forEach(vid => {
        listHtml += `
            <tr>
                <td>
                    <a href="/watch?v=${vid.id}"><b>${vid.title}</b></a><br>
                    <small>Author: ${vid.author} | Length: ${vid.duration}</small>
                </td>
            </tr>
            <tr><td><hr></td></tr>
        `;
    });

    res.send(`
        <html>
        <head>
            <title>YouTube - Broadcast Yourself. (2007)</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body bgcolor="#ffffff" text="#000000" link="#0033cc" vlink="#0033cc">
            <table width="100%" bgcolor="#e5e5e5" cellpadding="5">
                <tr>
                    <td><b><font size="4" color="#cc0000">YOU</font><font size="4">TUBE</font></b> | <a href="/">Home</a></td>
                </tr>
            </table>
            <hr>
            <h3>immortal majonez life</h3>
            <table width="100%">
                ${listHtml}
            </table>
            <hr>
            <p><b>Search Video:</b></p>
            <form action="/search" method="GET">
                <input type="text" name="q" size="15">
                <input type="submit" value="Search">
            </form>
        </body>
        </html>
    `);
});

// Wyszukiwarka - przeszukuje sieć normalnie przez stabilne API
app.get('/search', async (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) return res.redirect('/');

    const items = await searchPiped(query);

    let htmlResults = '';
    if (items.length > 0) {
        items.slice(0, 10).forEach(vid => {
            const videoId = vid.url ? vid.url.replace('/watch?v=', '') : '';
            if (videoId) {
                const durationSec = vid.duration || 0;
                const durFormatted = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;
                htmlResults += `
                    <tr>
                        <td>
                            <a href="/watch?v=${videoId}"><b>${vid.title}</b></a><br>
                            <small>Author: ${vid.uploaderName || 'Unknown'} | Length: ${durFormatted}</small>
                        </td>
                    </tr>
                    <tr><td><hr></td></tr>
                `;
            }
        });
    } else {
        htmlResults = `<tr><td>No results found for "${query}". Try another query.</td></tr>`;
    }

    res.send(`
        <html>
        <head><title>Search Results: ${query}</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[< Back to Home]</a>
            <h3>Search Results for: ${query}</h3>
            <table width="100%">
                ${htmlResults}
            </table>
        </body>
        </html>
    `);
});

// Odtwarzacz
app.get('/watch', (req, res) => {
    const videoId = req.query.v || '9NSLocUJn4s';

    res.send(`
        <html>
        <head><title>Watch - YouTube 2007</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[< Home]</a><br><br>
            
            <iframe width="300" height="225" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>
            
            <br><br>
            <hr>
            <small>Retro YouTube Proxy Service</small>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
