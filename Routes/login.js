const express = require("express");
const Route   = express.Router();
const mysql   = require("mysql");
const bcrypt  = require("bcrypt");
const nodeMailer = require("nodemailer");

//global variables
Email = "";
Username = "";
UserId = 0;
Otp = 0;

//message object
message = {
    invalid : ""
};

//mysql pool
const pool = mysql.createPool({
    host     : process.env.HOSTNAME,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE_NAME,
    port     : process.env.DATABASE_PORT
});

//login slash route
Route.get('/', (req, res)=>{
    res.render("login.ejs",message);
});

//login varification
Route.post('/',(req,res)=>{

    //store data in const
    const {email, password} = req.body;

    //mysql check email id
    pool.getConnection((err, con)=>{

	if(err) throw err;
	else{
	    con.query("SELECT user_id,user_name,email,password FROM users WHERE email=?",[email], (error,result)=>{
		if(result.length == 0){
		    message.invalid = "invalid email or password!";
		    res.render("login.ejs",message);
		    console.log("RESPONSE : invalid email or password");
		}

		else if(result.length == 1){

		    //write global variables
		    Username = result[0].user_name;
		    Email    = result[0].email;
		    UserId   = result[0].user_id;

		    //exports data
		    module.exports.username = Username;
		    module.exports.email    = Email;
		    
		    bcrypt.compare(password,result[0].password)
			.then((pass)=>{
			    //send otp page
			    res.render("otp.ejs",{
				handlePath:"/login/otpNumber",
				message : ""
			    });

			    //setup nodemailer
			    const transporter = nodeMailer.createTransport({
				service: process.env.SERVICE_PROVIDER,
				auth: {
				    user: process.env.EMAIL_ID,
				    pass: process.env.EMAIL_PASSWORD
				}
			    });

			    //otp number
			    otp = Math.floor(100000 + Math.random() * 900000);
			    Otp = otp;
			    const mailOption = {

				from: "vinminservice@gmail.com",
				to: [Email],
				subject: "vinmeen service",
				html: `<div style="font-family:sans-serif; font-size:20px; padding:15px; width:650px; margin:0 auto; border-radius:0 15px; background-color:black; color:white;">
        <div style="font-style:italic; color:white; ">VINMEEN SERVICE</div>
        <h1 style="text-align:center; font-weight:normal; color:white;">OTP Verification</h1>
        <p style="color:white; ">
            Hi ${result[0].user_name},
            <br>
            vinmeen one time authentication. this otp is valid in 60 seconds
        <span class="otpNumber"
            style="width:max-content; display:block; margin:60px auto 0; font-family:monospace; font-size:40px;">${otp}</span>
        </div>`
			    }

			    //send mail
			    transporter.sendMail(mailOption,(e,r)=>{
				if(e) console.log(e.message);
				else console.log("RESPONSE : OTP mail are sent");
			    });

			//promise
			})
			.catch((fail)=>{
			    if(fail) console.log("ERROR    : ",fail.name,fail.message);

			});
		}
	    });
	}

    });



    //post
});

//otp verify
Route.post('/otpNumber', (req,res)=>{
    if(req.body.otp == Otp){
	console.log("RESPONSE : OTP is correct render homepage");
	res.render( "userHomePage.ejs",{
	    userFirstLetter : Username[0],
	    id              : UserId
	} );
    }
    else{
	console.log("RESPONSE : OTP is incorrect");
	res.render("otp.ejs",{
	    handlePath:"/login/otpNumber",
	    message : "OTP is incorrect"
	});
    }
});


module.exports = Route;

