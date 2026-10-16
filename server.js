const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Homepage
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
            <small>Direct Scraping Engine (No External API Required)</small>
        </body>
        </html>
    `);
});

// Search Page (Scrapes YouTube Results via HTML Engine)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
        // Fetch results via DuckDuckGo HTML lite
        const response = await fetch(`https://html.duckduckgo.com/html/?q=site:youtube.com/watch+${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();

        // Extract YouTube Video IDs and Titles using Regex
        const regex = /href="[^"]*youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"[^>]*>(.*?)<\/a>/g;
        let match;
        let htmlResults = '';
        let count = 0;
        const foundIds = new Set();

        while ((match = regex.exec(html)) !== null && count < 10) {
            const videoId = match[1];
            let title = match[2].replace(/<[^>]+>/g, '').trim(); // Clean HTML tags
            
            if (!foundIds.has(videoId) && title) {
                foundIds.add(videoId);
                count++;
                htmlResults += `
                    <tr>
                        <td valign="top">
                            <a href="/watch?v=${videoId}">
                                <b>${title}</b>
                            </a><br>
                            <small>ID: ${videoId}</small>
                        </td>
                    </tr>
                    <tr><td><hr></td></tr>
                `;
            }
        }

        res.send(`
            <html>
            <head><title>Search: ${query}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[< Back to Home]</a>
                <h3>Search Results for: ${query}</h3>
                <table width="100%">
                    ${htmlResults || '<tr><td>No results found. Try another query.</td></tr>'}
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

    // Stream URLs generated via direct proxy embed format
    const streamUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const directMp4Url = `https://y2mate.is/watch?v=${videoId}`; // Alternative legacy link

    res.send(`
        <html>
        <head><title>Watch Video - ${videoId}</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[Home]</a><br><br>
            <b>Video ID: ${videoId}</b><br><br>
            
            <table bgcolor="#ffffcc" border="1" cellpadding="5">
                <tr>
                    <td>
                        <b><a href="https://cobalt.tools">► PLAY / DOWNLOAD STREAM</a></b><br>
                        <small>Direct Link for Mobile Players</small>
                    </td>
                </tr>
            </table>
            <br>
            <p><b>Video Embed Preview (for PC):</b></p>
            <iframe width="280" height="210" src="${streamUrl}" frameborder="0" allowfullscreen></iframe>
            <hr>
            <p><small>Retro YouTube Proxy Service</small></p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
