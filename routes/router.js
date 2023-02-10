const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const {Configuration, OpenAIApi } = require("openai")
require('../db/conn');
const User = require("../model/userSchema");
const authenticate = require("../middleware/authenticate")

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

router.get("/", (req, res) => {
    res.send(`Hollo world from the server`);
});


router.post('/register', async (req, res) => {

    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password ) {
        res.status(422).json({ error: "plz filled the field properly" })
    }

    try {

        const userExist = await User.findOne({ email: email});
        if (userExist) {
            res.status(422).json({ error: "Email Already Exist" });
        } else {
            const user = new User({ name, email, phone, password, });

            const storData = await user.save();
                res.status(201).json({status:201,storData});
        }

    } catch (error) {
        res.status(422).json(error)
        console.log("catch block error");

    }


});

router.post('/signin', async (req, res) => {
    
    const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({error:"plz Filled the data"})
        }
    
    try {
        
        const userLogin = await User.findOne({ email: email });

            if (userLogin) {
                const isMatch = await bcrypt.compare(password,userLogin.password);

            if (!isMatch) {
                res.status(400).json({error: "invalid credientials"});
            } else {
                const token = await userLogin.generateAuthToken();
                res.cookie("jwtoken", token,{
                    expires: new Date(Date.now() + 2589200000),
                    httpOnly:true
                });
                const result = {
                    userLogin,
                    token
                }
                res.status(201).json({status:201,result});
            }
            } else {
                res.status(400).json({error: "invalid credientials"});
            }

    } catch (err) {
            console.log(err);
    }
    });

router.post("/chat", async (req, res) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: req.body.input,
            temperature: 0,
            max_tokens: 4000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
          });
          res.status(200).send({
            bot: response.data.choices[0].text
          })
    } catch (err) {
        res.status(500).send(err)
    }
});

router.get("/desh", authenticate , async (req, res) => {
    try{
        const ValidUserOne = await User.findOne({_id:req.userID})
        res.status(201).json({status:201, ValidUserOne})
    }catch{
        res.status(401).json({status:401, err})
    }
})

module.exports = router;