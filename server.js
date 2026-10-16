const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Baza gotowych, kultowych filmów (działa w 100% bez awarii i zewnętrznych API)
const RETRO_VIDEOS = [
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', duration: '3:32', author: 'RickAstleyVEVO' },
    { id: 'jNQXAC9IVRw', title: 'Me at the zoo (First YouTube video ever)', duration: '0:19', author: 'jawed' },
    { id: '1xe_kWV2jUA', title: 'Bad Seat Driver', duration: '2:15', author: 'RetroFan' },
    { id: 'ZZ5LpwO-An4', title: 'Evolution of Dance', duration: '6:00', author: 'Judson Laipply' }
];

// Strona główna z listą polecanych / wyszukiwarką po bazie
app.get('/', (req, res) => {
    let listHtml = '';
    RETRO_VIDEOS.forEach(vid => {
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
            <h3>Featured 2007 Videos</h3>
            <table width="100%">
                ${listHtml}
            </table>
            <hr>
            <p><b>Watch by Video ID:</b></p>
            <form action="/watch" method="GET">
                <input type="text" name="v" size="12">
                <input type="submit" value="Play ID">
            </form>
        </body>
        </html>
    `);
});

// Wyszukiwanie lokalne po bazie
app.get('/search', (req, res) => {
    const query = (req.query.q || '').toLowerCase();
    const filtered = RETRO_VIDEOS.filter(v => v.title.toLowerCase().includes(query));

    let htmlResults = '';
    filtered.forEach(vid => {
        htmlResults += `
            <tr>
                <td>
                    <a href="/watch?v=${vid.id}"><b>${vid.title}</b></a><br>
                    <small>Author: ${vid.author}</small>
                </td>
            </tr>
            <tr><td><hr></td></tr>
        `;
    });

    res.send(`
        <html>
        <head><title>Search Results</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[< Back to Home]</a>
            <h3>Results for: ${req.query.q}</h3>
            <table width="100%">
                ${htmlResults || '<tr><td>No local results found. Try Rickroll (dQw4w9WgXcQ) or first video (jNQXAC9IVRw).</td></tr>'}
            </table>
        </body>
        </html>
    `);
});

// Własny odtwarzacz na stronie (bez redirectów)
app.get('/watch', (req, res) => {
    const videoId = req.query.v || 'dQw4w9WgXcQ';

    res.send(`
        <html>
        <head><title>Watch - YouTube 2007</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[< Home]</a><br><br>
            <h3>Now Playing (ID: ${videoId})</h3>
            
            <!-- Odtwarzacz osadzony bezpośrednio na Twojej stronie -->
            <iframe width="300" height="225" src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" frameborder="0" allowfullscreen></iframe>
            
            <br><br>
            <hr>
            <small>Retro YouTube Local Player</small>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
