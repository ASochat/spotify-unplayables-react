const http = require('http') 
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

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

const PORT = process.env.PORT || 3001
console.log(process.env)
console.log(process.env.PORT)
console.log(process.env.SPOTIFY_APP_CLIENT_ID)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


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