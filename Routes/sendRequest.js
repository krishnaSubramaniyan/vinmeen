const express    = require("express");
const Route      = express.Router();
const mysql      = require("mysql");
const nodeMailer = require("nodemailer");
const path       = require("path");
const login      = require("./login.js");
const signUp     = require("./signUp.js");


//pool
const pool = mysql.createPool({
    host     : process.env.HOSTNAME,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE_NAME
});

//userData

userData = undefined;

// slash route
Route.get("/:productId",(req, res)=>{
    if(login.username == undefined && signUp.username == undefined){
	res.sendFile("loginFirst.html",{root : path.join(__dirname , "../public/html") });
	console.log("RESPONSE : login first page are sent");
    }// solve data problem
    else{
	if(userData == undefined){
	    userData = (login.username != undefined)?login:signUp;
	}
	//get connection
	pool.getConnection((err,con)=>{

	    if(err) console.log("ERROR    : ",err.name,err.message);
	    else{

		//get email
		con.query("SELECT email FROM users WHERE user_id=(SELECT user_id FROM products WHERE product_id=?)",[req.params.productId],(err1,result1)=>{

		    if(err1) console.log("ERROR    : ",err1.name,err1.message);
		    else{
			//email
			con.query("SELECT product_name FROM products WHERE product_id=?",[req.params.productId],(err2,result2)=>{
			    if(err2) console.log("ERROR    : ",err2.name,err2.message);
			    else{
				//product name

				//setup nodemailer
				const transporter = nodeMailer.createTransport({
				    service: process.env.SERVICE_PROVIDER,
				    auth: {
					user: process.env.EMAIL_ID,
					pass: process.env.EMAIL_PASSWORD
				    }
				});

				const mailOption = {
				    from    : "vinminservice@gmail.com",
				    to      : result1[0].email,
				    subject : "request to rent prodect",
				    html    : `<div style="font-family:sans-serif; width:600px; height:280px; background-color:#2c3e50; color:#ecf0f1; padding:20px; border-radius:10px;">
        <div style="display:flex; align-items:center; padding:7px;">
            <img src="https://static.vecteezy.com/system/resources/previews/014/835/004/non_2x/star-icon-vector.jpg"
                style="width:40px; height:40px; border-radius:25px; object-fit:contain; background-color:#ecf0f1;">
            <span style="font-size:22px; margin-left:11px">Vinmeen Service</span>
        </div>
        <div>
            <h1 style="text-align:center; font-size:33px; font-weight:normal; letter-spacing:7px; margin:33px 0 35px;">
                Great News!</h1>
            <p style="font-size:20px; line-height:26px;">
                <i>${userData.username}</i> wants to rent a <b>${result2[0].product_name}</b>.
                <br>
                Please response to <i>${userData.username}</i>
                <br>
                mail to <a href="mailto:${userData.email}?&bcc=vinminservice@gmail.com&subject=rent product response"
                    style="text-decoration:none; color:#70a1ff;">${userData.username}</a>
            </p>
        </div>
    </div>`
				}//mail option

				transporter.sendMail(mailOption, (err,result)=>{
				    if(err) console.log("ERROR    : ",err.name,err.message);
				    else{
					console.log("RESPONSE : email sent");
					res.render("productResponse.ejs",{
					    title : "email sent",
					    message : "product rent request sent",
					    backNumber : 1
					});
				    }
				});
			    }
			});
		    }//else
		    
		});
		
	    }
	    con.release();
	});
    }
});


//exports
module.exports = Route;
