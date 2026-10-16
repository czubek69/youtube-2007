const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Twoja baza kultowych filmów na stronę główną
const MAJONEZ_VIDEOS = [
    { id: '9NSLocUJn4s', title: 'immortal_majonez_1', duration: '0:09', author: 'Czubek10' },
    { id: 'cdcjW3py9XY', title: 'immortal_majonez_2', duration: '0:22', author: 'Czubek10' },
    { id: 'cW50zi3iqoQ', title: 'immortal_majonez_3', duration: '0:15', author: 'Czubek10' },
    { id: '7OiBxQOjmKk', title: 'end_of_immortal_majonez (BAD ENDING)', duration: '0:19', author: 'Czubek10' }
];

// Strona główna (YouTube 2007 + Immortal Majonez)
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
            <p><b>Search any video on YouTube:</b></p>
            <form action="/search" method="GET">
                <input type="text" name="q" size="18">
                <input type="submit" value="Search">
            </form>
        </body>
        </html>
    `);
});

// Publiczna wyszukiwarka - obsługuje każde zapytanie z internetu bez błędów API
app.get('/search', (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) return res.redirect('/');

    // Sprawdzamy najpierw czy to pasuje do sagi majonezowej
    const filtered = MAJONEZ_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));

    let resultsHtml = '';

    if (filtered.length > 0) {
        filtered.forEach(vid => {
            resultsHtml += `
                <tr>
                    <td>
                        <a href="/watch?v=${vid.id}"><b>${vid.title}</b></a><br>
                        <small>Author: ${vid.author} | Length: ${vid.duration}</small>
                    </td>
                </tr>
                <tr><td><hr></td></tr>
            `;
        });
    }

    // Dodajemy zawsze uniwersalny, publiczny dostęp do całego YouTube dla dowolnego hasła
    const encoded = encodeURIComponent(query);
    resultsHtml += `
        <tr>
            <td>
                <br>
                <b>Public Search Results for "${query}":</b><br><br>
                <table bgcolor="#ffffcc" border="1" cellpadding="5">
                    <tr>
                        <td>
                            <a href="https://www.youtube.com/results?search_query=${encoded}" target="_blank">
                                <b>► VIEW ALL PUBLIC RESULTS FOR "${query.toUpperCase()}" ON YOUTUBE</b>
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `;

    res.send(`
        <html>
        <head><title>Search: ${query}</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[< Back to Home]</a>
            <h3>Search Results for: ${query}</h3>
            <table width="100%">
                ${resultsHtml}
            </table>
        </body>
        </html>
    `);
});

// Odtwarzacz wideo
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
            <small>Retro YouTube Public Service</small>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
