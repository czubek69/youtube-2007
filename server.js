const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Stara strona główna z 2007 roku
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>YouTube - Broadcast Yourself. (2007)</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        </head>
        <body bgcolor="#ffffff" text="#000000">
            <table width="100%" bgcolor="#e5e5e5" cellpadding="5">
                <tr>
                    <td><b><font size="4" color="#cc0000">YOU</font><font size="4">TUBE</font></b> | <a href="/">Home</a></td>
                </tr>
            </table>
            <hr>
            <h3>Witaj wideo-archiwum!</h3>
            <p>Wpisz czego szukasz:</p>
            <form action="/watch" method="GET">
                <input type="text" name="q" size="15">
                <input type="submit" value="Szukaj">
            </form>
            <br><hr>
            <small>Projekt Retro dla Sony Ericsson / Starych telefonów</small>
        </body>
        </html>
    `);
});

// Strona wyników
app.get('/watch', (req, res) => {
    const query = req.query.q || "Nic";
    res.send(`
        <html>
        <head><title>Odtwarzacz - YouTube 2007</title></head>
        <body bgcolor="#ffffff">
            <a href="/">[Powrót do strony głównej]</a>
            <h3>Wyniki wyszukiwania dla: ${query}</h3>
            <p>W pełnej wersji tutaj pojawią się filmy skonwertowane do 3GP.</p>
            <hr>
            <a href="https://www.w3schools.com/html/mov_bbb.mp4">Testowe wideo MP4/3GP</a>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Serwer wystartował na porcie ${PORT}`);
});