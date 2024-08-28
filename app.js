const express = require('express');
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));
app.set("view engine","ejs");

app.get('/',function(req,res){
    res.status(200).render('index');
})

app.post('/Pdf',async function(req,res){
    var {chatLink} = req.body;
    console.log(chatLink);
    if(!chatLink)
    {
        res.status(404).send('Link is Empty');
    }
    else
    {
        try
        {
            //Ek headless browser launch hoga 
            const newBrowser = await puppeteer.launch();
            console.log('headless browser launched');
            //ek new tab open hoga us browser instance me
            const newTab = await newBrowser.newPage();
            console.log('new Tab opened');
            //chatLink Url me new tab open hoga
            await newTab.goto(chatLink, {waitUntil : 'networkidle2', timeout : 60000});
            console.log('Went to the chatLink');
            
            const pdfBuffer = await newTab.pdf();
            console.log('created the pdf buffer');

            res.setHeader('Content-Type', 'application/pdf');
            console.log('response is being sent from the server');

            res.send(pdfBuffer);
        } catch (err)
        {
            console.log('Something Went Wrong',err);
        }

    }
})

app.get('*',function(req,res){
    res.status(404).send("This Url Doesn't Exist !! Pls Go To /");
})

app.listen(3000,function(req,res){
    console.log(`server is running smoothly`);
})