require('dotenv').config({ path: '../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();


// Can't use import.meta.env.MODE because it's not available in CJS
const isProduction = process.env.NODE_ENV === 'production';
// console.log('process.env:', process.env);
console.log('Node ENV:', process.env.NODE_ENV);
// console.log('PORT:', process.env.PORT);
console.log('isProduction:', isProduction);

// CORS configuration
app.use(cors({
  origin: isProduction 
    ? ['https://unplayables.soch.at', 'http://localhost:3001']  // Production (both remote and local)
    : 'http://localhost:3000',                                   // Development
  credentials: true
}));

// API ROUTES MUST COME BEFORE STATIC FILES
// Define all API routes first
app.get('/api/genius/search', async (req, res) => {
    try {
        const { q, access_token } = req.query;
        console.log('Genius search request:', { query: q, hasToken: !!access_token });
        
        // Make sure we're calling the Genius API directly
        const geniusResponse = await axios.get('https://api.genius.com/search', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json'
            },
            params: { q }
        });

        // Log the response structure for debugging
        console.log('Genius API response structure:', {
            hasResponse: !!geniusResponse.data,
            hasHits: !!geniusResponse.data?.response?.hits
        });

        // Send back just the data part
        res.json(geniusResponse.data);
    } catch (error) {
        console.error('Genius API error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            stack: error.stack
        });
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

app.get('/api/lyrics', async (req, res) => {
    try {
        const { url } = req.query;
        console.log('Attempting to fetch lyrics from:', url);  // Log the URL being requested
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            validateStatus: function (status) {
                return status < 500; // Resolve only if status is less than 500
            }
        });
        
        if (response.status === 403) {
            console.error('Access forbidden by Genius. Response:', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
            });
            return res.status(403).json({
                error: 'Access forbidden by Genius',
                details: response.data
            });
        }
        
        res.send(response.data);
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: req.query.url,
            responseData: error.response?.data,
            responseHeaders: error.response?.headers
        });
        
        res.status(500).send({
            error: error.message,
            details: error.response?.data
        });
    }
});

// AFTER all API routes, THEN serve static files
if (isProduction) {
    // Serve static files from the dist directory
    app.use(express.static(path.join(__dirname, '../dist')));
    
    // Handle all other routes by serving index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}

// Always use port 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
}); 



// DON'T THINK I NEED THAT PART ANYMORE SINCE I'M USING VITE AND import.meta.env
// const PORT = process.env.PORT || 3001
// console.log(process.env)
// console.log(process.env.PORT)
// console.log(process.env.SPOTIFY_APP_CLIENT_ID)

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })


////// API TO SET UP LATER //////
// app.get('/api/notes', (request, response) => {
//   response.json(notes)
// })

// app.get('/api/notes/:id', (request, response) => {
//     const id = request.params.id
//     const note = notes.find(note => note.id === id)
    
//     if (note) {
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
// })


/////// API POST TO SET UP LATER ////////
// app.post('/api/notes', (request, response) => {
//     const body = request.body

//     if (!body.content) {
//         return response.status(400).json({ 
//           error: 'content missing' 
//         })
//       }
    
//     const note = {
//         content: body.content,
//         important: Boolean(body.important) || false,
//         id: generateId(),
//       }

//     notes = notes.concat(note)

//     console.log(note)
//     response.json(note)
//   })