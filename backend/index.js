import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import User from './src/models/users';
import {createToken,verifyToken} from './src/resolvers/create';
import {verifyToken} from './src/resolvers/verify'

import graphQLHTTP from 'express-graphql';
import schema from './src/graphql'; 


const app = express();
const PORT = process.env.PORT || 3000

mongoose.connect('mongodb://admin:layton18@ds127771.mlab.com:27771/netflix-clone');

const db = mongoose.connection;
db.on('error', ()=>console.log("Error al conectar a la BD"))
  .once('open',()=> console.log("Conectado a la BD"))

app.use(bodyParser.json());

app.post('/signup',(req,res)=> {
   let user = req.body;
   User.create(user).then(() => {
    return res.status(201).json({"message":"Usuario Creado",
    "id": user._id})
   }).catch((err)=>{
     console.log(err);
    return res.json(err);
   })
})

app.post('/login', (req, res)=>{
  
  const token = createToken(req.body.email,req.body.password).then((token)=>{

    res.status(201).json({token});

  }).catch(()=>{
    res.status(403).json({
      message:"Login Failed!!! :( Invalid credentials"
    })
  })
})

app.get('/', (req,res) => {
  res.send("Estoy funcionando :)");
})

//Middleware para proteger graphql 
app.use('./graphql', (req,res,next) => {
  const token = req.headers['authorization'];
  try {
    req.user = verifyToken(token)
    next();
  }catch(error) {
    res.status(401).json({message:error.message})
  }
})

app.use('/graphql',graphQLHTTP((req,res)=> ({
  schema,
  graphiql:true,
  pretty:true,
  context:{
    user:req.user
  }
})))

app.listen(PORT, ()=> {
  console.log(`Magic happens in port ${PORT}`);
})