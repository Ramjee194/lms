import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerlWebhooks } from './controllers/webhooks.js'

//initialize express
const app=express()

//connect to database
await connectDB()

//MIddleware
app.use(cors())

//routes
app.get('/',(req,res)=>{
   
    res.send("app is working ")
})
app.post('/clerk',express.json(),clerlWebhooks)


//port
const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`app is runnig on port ${PORT}`)
})