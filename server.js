const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// List of stable Piped API instances
const PIPED_APIS = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
    'https://pipedapi.mha.fi',
    'https://pipedapi.drgns.space'
];

async function fetchPiped(endpoint) {
    for (const api of PIPED_APIS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`${api}${endpoint}`, { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) return await res.json();
        } catch (e) {
            console.log(`Attempt with ${api} failed, trying next...`);
        }
    }
    throw new Error('Could not connect to any API server.');
}

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
            <p>Optimized for legacy mobile browsers & feature phones (Sony Ericsson, Nokia, etc.)</p>
            <form action="/search" method="GET">
                <b>Search Video:</b><br>
                <input type="text" name="q" size="15"><br>
                <input type="submit" value="Search">
            </form>
            <hr>
            <small>Powered by Piped Engine Proxy</small>
        </body>
        </html>
    `);
});

// Search Results Page
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.redirect('/');

    try {
        const data = await fetchPiped(`/search?q=${encodeURIComponent(query)}&filter=videos`);
        const items = data.items || [];

        let htmlResults = '';
        items.slice(0, 10).forEach(vid => {
            const videoId = vid.url ? vid.url.replace('/watch?v=', '') : '';
            if (videoId) {
                htmlResults += `
                    <tr>
                        <td valign="top">
                            <a href="/watch?v=${videoId}">
                                <b>${vid.title}</b>
                            </a><br>
                            <small>By: ${vid.uploaderName || 'Unknown'} | Duration: ${vid.duration ? Math.floor(vid.duration / 60) + 'm ' + (vid.duration % 60) + 's' : 'N/A'}</small>
                        </td>
                    </tr>
                    <tr><td><hr></td></tr>
                `;
            }
        });

        res.send(`
            <html>
            <head><title>Search: ${query}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[< Back to Home]</a>
                <h3>Search Results for: ${query}</h3>
                <table width="100%">
                    ${htmlResults || 'No results found.'}
                </table>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Search error: ${err.message}`);
    }
});

// Watch / Media Player Page
app.get('/watch', async (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.redirect('/');

    try {
        const data = await fetchPiped(`/streams/${videoId}`);
        
        let streamUrl = '';
        if (data.streams && data.streams.length > 0) {
            // Prefer low-res MP4 for legacy mobile devices
            const mp4Stream = data.streams.find(s => s.format === 'MPEG-4' || (s.mimeType && s.mimeType.includes('mp4')));
            streamUrl = mp4Stream ? mp4Stream.url : data.streams[0].url;
        }

        if (!streamUrl) throw new Error('No compatible video stream found.');

        res.send(`
            <html>
            <head><title>${data.title}</title></head>
            <body bgcolor="#ffffff">
                <a href="/">[Home]</a><br><br>
                <b>${data.title}</b><br>
                <small>Uploader: ${data.uploader}</small><br><br>
                
                <table bgcolor="#ffffcc" border="1" cellpadding="5">
                    <tr>
                        <td>
                            <b><a href="${streamUrl}">► PLAY / DOWNLOAD VIDEO</a></b>
                        </td>
                    </tr>
                </table>
                <br>
                <p><small>Click the link above to stream video in your device's native media player.</small></p>
            </body>
            </html>
        `);
    } catch (err) {
        res.send(`Video load error: ${err.message}`);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
