const express = require('express')

const app = express()

app.get('/', (request, response) =>{
    response.send("Hola, mundo")
})

const PORT = 3001
app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}`)
})


