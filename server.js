const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Homepage (YouTube 2007 Retro)
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
                    <td><b><font size="4" color="#cc0000">YOU</font><font size="4">TUBE</font></b> | <a href="/">Home</a></td>
                </tr>
            </table>
            <hr>
            <h3>YouTube Mobile Retro (2007 Edition)</h3>
            <p>Optimized for legacy mobile browsers & feature phones</p>
            <form action="/search" method="GET">
                <b>Search Video:</b><br>
                <input type="text" name="q" size="15"><br>
                <input type="submit" value="Search">
            </form>
            <hr>
            <small>Direct Open API Engine (No Keys Required)</small>
        </body>
        </html>
    `);
});

// Search Page
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
                        <small>Duration: ${Math.floor(vid.lengthSeconds / 60)}m | Author: ${vid.author}</small>
                    </td>
                </tr>
                <tr><td><hr></td></tr>
            `;
        });

        res.send(`
            <html>
            <head><title>Search: ${query}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[< Back to Home]</a>
                <h3>Search Results for: ${query}</h3>
                <table width="100%">
                    ${htmlResults || '<tr><td>No results found.</td></tr>'}
                </table>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Search error: ${err.message}`);
    }
});

// Player Page
app.get('/watch', (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.redirect('/');

    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    res.send(`
        <html>
        <head><title>Watch Video - ${videoId}</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[Home]</a><br><br>
            <b>Video ID: ${videoId}</b><br><br>
            
            <table bgcolor="#ffffcc" border="1" cellpadding="5">
                <tr>
                    <td>
                        <b><a href="https://www.youtube.com/watch?v=${videoId}">► PLAY VIDEO ON YOUTUBE</a></b>
                    </td>
                </tr>
            </table>
            <br>
            <p><b>Embedded Player:</b></p>
            <iframe width="280" height="210" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
            <hr>
            <small>Retro YouTube Proxy Service</small>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
