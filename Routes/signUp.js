const express = require("express");
const Route  = express.Router();
const mysql   = require("mysql");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");


//error message variables
let message = {
    username : "",
    password : "",
    email : "!"
};

// slash route
Route.get('/', (req,res)=>{
    res.render("signUp.ejs",message);
});

// global variables
var Username = "";
var Password = "";
var Email    = "";
var otp = 0;

//mysql create pool
const pool = mysql.createPool({
    host     : process.env.DB_HOSTNAME,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port     : process.env.DB_PORT
});

//user data insert function
async function dataInsert(username,email,password,homePage){
    const encryptedPassword = await bcrypt.hash(password,8);
    pool.getConnection((err,con)=>{
	if(err){
	    console.log("ERROR    :  ",err.name,err.message);
	}
	else{
	    con.query("INSERT INTO users(user_name, email, password) values(?,?,?)",[username,email,encryptedPassword],(error,result)=>{
		if(error){
		    console.log("ERROR    : ",error.name,error.message);
		}else{
		    //export name and email
		    module.exports.username = username;
		    module.exports.email    = email;
		    
		    console.log("RESPONSE : signup complete user data are inserted");
		    console.log("RESPONSE : user id = ",result.insertId);
		    homePage(result.insertId);
		}
	    });
	}
    });
}

// post route
Route.post('/',(req, res)=>{

    const {username, email, password} = req.body;
    Username = username;
    Password = password;
    Email    = email;
    
    //check email exists condition
    pool.getConnection((err, con)=>{

	if(err) throw err;
	else{
	    con.query("SELECT email FROM users WHERE email=?",[email],(err, result)=>{
		if(err) console.log("ERROR    : ",err.name,err.message);
		else{
		    if(result.length == 0){
			console.log("RESPONSE : email id is accept");

			//send otp page
			res.render("otp.ejs",{
			    handlePath:"/signup/otpNumber",
			    message : ""
			});
			console.log("RESPONSE : OTP page are sent");

			
			//send otp
			const transporter = nodeMailer.createTransport({
		
			    service: process.env.EMAIL_SERVICE_PROVIDER,
			    auth: {
				user: process.env.EMAIL_ID,
				pass: process.env.EMAIL_PASSWORD
			    }
			});

			//option data
			otp = Math.floor(100000 + Math.random() * 900000);
			const mailOption = {
			    from    : process.env.EMAIL_ID,
			    to      : email,
			    subject : process.env.BRAND_NAME,
			    html    : `<div style="font-family:sans-serif; font-size:20px; padding:15px; width:650px; margin:0 auto; border-radius:0 15px; background-color:black; color:white;">
        <div style="font-style:italic; color:white; ">${process.env.BRAND_NAME}</div>
        <h1 style="text-align:center; font-weight:normal; color:white;">OTP Verification</h1>
        <p style="color:white; ">
            Hi ${username},
            <br>
            vinmeen one time authentication. this otp is valid in 60 seconds
        <span class="otpNumber"
            style="width:max-content; display:block; margin:60px auto 0; font-family:monospace; font-size:40px;">${otp}</span>
        </div>`
			}

			//send mail
			transporter.sendMail(mailOption, (err, result) => {
			    if (err) {
				console.log("ERROR    : ",err.name,err.message);
			    } else {
				console.log("RESPONSE : OTP sent to mail")
			    }
			});
		
		    }else{
			console.log("ERROR    :  email are already exists");
			message.username = username;
			message.password = password;
			message.email = "email id already exists";
			res.render("signUp.ejs",message);
		    }
		}
		con.release();
	    });
	}
	
    });

});


//otp varification route
Route.post('/otpNumber',(req, res)=>{
    
    if(req.body.otp == otp){
	dataInsert(Username,Email,Password,(ID)=>{
	    res.render("userHomePage.ejs",{
		userFirstLetter : Username[0],
		id              : ID
	    });
	});
	console.log("RESPONSE : mysql data inserted");	
	}
    else{
	//resend OTP page
	console.log("RESPONSE : OTP incorrect resend OTP page");
	res.render("otp.ejs",{
	  handlePath:"/signup/otpNumber",
	    message : "OTP incorrect!"
	 });
	 }
    
});





//exports
module.exports = Route;
