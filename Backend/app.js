const express = require('express');
const app = express();

app.use(express.json());


app.get('/', (req,res) =>{
    res.send("Server is Running!");
})

app.listen(3000, ()=>{
    console.log("Server is listening on port Number 3000");
})