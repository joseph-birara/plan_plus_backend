const User = require('../models/user')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const register = async (req, res) => {
    // create user    
    console.log(Math.floor(1000 + Math.random() * 9000))
    await User.create({ ...req.body})
    .then((result) => {
        // create JWT token
        const token = result.createJWT()
        // send the result to front end
        res.status(201).json({ email:result.email, Token:token })
    })
    .catch((err) => {
        if(err.code === 11000){ // check for deplicated key (email)
             console.log("This email is already taken")
            res.status(400).json({err:"This email is already taken"})
        }else{
             console.log(err.message)
            res.status(400).json({err:err.message}) 
        }
        
    })
    
}


const login = async (req, res) => {
    const { email, password } = req.body
    //console.log(email.toLowerCase())
    //console.log(email.trim())
    //console.log(email,password)
    // check require email and password
    if(!email || !password){
        console.log( `please provide all input`)
        return res.status(400).json({err: "please provide all input"})
    }

    // check user with this email
    const user = await User.findOne({email}).catch((err) => {
        console.log(err.message)
        res.json({err:err.message})
    })
    if(!user){
        console.log( `Invalid Credentials(email)`)
        return res.status(400).json({err: `Invalid Credentials`})
    }
    // check password
    const checkPassword = await user.comparePassword(password)
    .catch((err) => {
        console.log(err.message)
    })
    if(!checkPassword){
        console.log( `Invalid Credentials(password)`)
        return res.status(400).json({err: `Invalid Credentials`})
    }

    // create token
    const token = user.createJWT()
    // send result to front end
    res.status(201).json({ email:user.email, Token:token })


}  

const sendEmail = async(req, res) => {
    const { email } = req.body
    // check user with this email
    const user = await User.findOne({ email }).catch((err) => {
        console.log(err.message)
        res.json({err:err.message})
    })
    if(!user){
        console.log( `there is no user with this email`)
        return res.status(400).json({err: `there is no user with this email`})
    }else{
    //generate four digit number 
    var code = Math.floor(1000 + Math.random() * 9000);

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD
    }
  });
  
  var mailOptions = {
    from: process.env.MY_EMAIL,
    to: req.body.email,
    subject: 'Reset password for todo app',
    text:  `Reset password for todo app
    The code is : ${code}
    The code will expire in 1 day.`
  };
  
  transporter.sendMail(mailOptions, async function(error, info){
    if (error) {
      console.log(error);
    } else {
      const vCode = user.createVerificationCode(code);
      await User.findByIdAndUpdate(user._id,{verificationCode:vCode})
      .catch((err) => {
        console.log(err.message)
        res.json({err:err.message})
            })
      console.log('Email sent: ' + info.response);
      res.json({
        userId:user._id,
        message:"Email send successfully"
    })
    }
  }); 
    }
}

const checkCode = async(req, res) => {
    const {  code } = req.body
    const user = await User.findById(req.params.id).catch((err) => {
        console.log(err.message)
        res.json({err:err.message})
    })
    if(!user){
        console.log( `there is no user with this email`)
        return res.status(400).json({err: `there is no user with this email`})
    }
    const payload = jwt.verify(user.verificationCode, process.env.JWT_SECRET)
    if(payload.code == code){
        res.json({
            userId:user._id,
            message:"code matched"
        })
    }else{
        res.json({
            err:"wrong code, try again."
        })
    }
}

const updatePassword = async(req, res) => {
    const { password } = req.body
    const salt = await bcrypt.genSalt(10)
    //console.log(this.password.trim())
    const hashedPassword = await bcrypt.hash(password, salt) 
    const user = await User.findByIdAndUpdate(req.params.id, {password:hashedPassword}).catch((err) => {
        console.log(err.message)
        res.json({err:err.message})
    })
    if(!user){
        console.log( `there is no user with this email`)
        return res.status(400).json({err: `there is no user with this email`})
    }
    res.json({
        message:"password changed successfully"
    })
}
 

// Export controller
module.exports = { register, login, sendEmail, checkCode, updatePassword}