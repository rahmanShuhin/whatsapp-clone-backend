//importing
import express from "express";
import mongoose from "mongoose";
import Message from "./dbMessage.js";
import Pusher from "pusher";
import cors from "cors";
//app config
const app=express();

//middleware
app.use(express.json());
app.use(cors())




//pusher
const pusher = new Pusher({
  appId: '1089541',
  key: 'd2fc256a8a85e6d46ab6',
  secret: '37297dfea0da0aadb185',
  cluster: 'ap2',
  encrypted: true
});

const db=mongoose.connection;
db.once('open',()=>{
  console.log("db connected")
  const msgCollection=db.collection("messagecontents");
  const changeStream=msgCollection.watch()
changeStream.on('change',(change)=>{
  console.log("a change occur",change)

  if(change.operationType==="insert" ){
    const messageDetails=change.fullDocument
    pusher.trigger("message","inserted",{
      name:messageDetails.name,
      message:messageDetails.message,
      timestamp:messageDetails.timestamp,
      received:messageDetails.received
    });
  }
  else{
    console.log("error trigger pusher")
  }
})

})



//db config
const connection_url=`mongodb+srv://admin:w5I5bBIrHc07gO6c@cluster0.6mh1k.mongodb.net/whatsappdb?retryWrites=true&w=majority`
mongoose.connect(connection_url,{useCreateIndex:true,useNewUrlParser:true,useUnifiedTopology:true})


//app route
app.get('/',(req,res)=>res.status(200).send('hello world !'))

app.get('/messages/sync',(req,res)=>{
  Message.find((err,data)=>{
    if(err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data)
    }

  })
})


app.post('/messages/new',(req,res)=>{
  const dbMessage=req.body
  Message.create(dbMessage,(err,data)=>{
    if(err){
      res.status(500).send(err)
    }
    else{
      res.status(201).send(data)
    }
  })
})

//listen


const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`server is running ${port}`))