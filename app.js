const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));
app.set("view engine","ejs");

app.get('/',function(req,res){
    res.status(200).render('index');
})

app.post('/Pdf',function(req,res){
    
})

app.get('*',function(req,res){
    res.status(404).send("This Url Doesn't Exist !! Pls Go To /");
})

app.listen(3000,function(req,res){
    console.log(`server is running smoothly`);
})