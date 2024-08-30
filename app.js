const express = require('express');
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));
app.set("view engine","ejs");

app.get('/',function(req,res){
    res.status(200).render('index');
})

async function autoscroll(newTab) {
    let iteration = 0;
    let maxIteration = 20; // Increased iteration count
    let previousHeight = await newTab.evaluate(function() {
        return document.body.scrollHeight;
    });

    while (iteration <= maxIteration) {
        await newTab.evaluate(function() {
            window.scrollTo(0, document.body.scrollHeight);
        });

        try {
            await newTab.waitForFunction(
                function(previousHeight) {
                    return document.body.scrollHeight > previousHeight;
                },
                {},
                previousHeight,
                { timeout: 120000 } // Increased timeout
            );
        } catch (error) {
            console.error('waitForFunction failed:', error);
            break; // Exit the loop if there's an error
        }

        await new Promise(function(resolve) {
            setTimeout(resolve, 2000); // Increased delay
        });

        const currentHeight = await newTab.evaluate(function() {
            return document.body.scrollHeight;
        });

        console.log(`Iteration ${iteration}: previousHeight = ${previousHeight}, currentHeight = ${currentHeight}`);

        if (currentHeight === previousHeight) break;
        previousHeight = currentHeight;
        iteration++;
    }
}


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
            
            await autoscroll(newTab);

            //by default single page pdf hi generate hogi to handle it hume page size dena hoga and any other info to handle it
            const pdfBuffer = await newTab.pdf({
             format : 'A4',
             printBackground : true,
             margin : {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
             }
            });
            console.log('created the pdf buffer');

           //khdki server pr file ko check krta hu file pehle
            fs.writeFileSync('output.pdf',pdfBuffer);
            //Note : ye response.pdf ek valid file hai but chat.pdf ki validity khi se corrupt ho rhi hai.

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="chat.pdf"');

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