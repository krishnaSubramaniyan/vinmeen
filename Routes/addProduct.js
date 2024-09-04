const express = require("express");
const Route   = express.Router();
const multer  = require("multer");
const mysql   = require("mysql");
const path    = require("path");

//global variables
var UserId;
var ImagePath;


// /addproduct route
Route.get('/:id', (req, res)=>{
    res.render("addProduct.ejs");
    UserId = req.params.id;
    console.log("RESPONSE : user id ",UserId);
});

//mysql createpool
const pool = mysql.createPool({
    host     : process.env.HOSTNAME,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE_NAME,
    port     : process.env.DATABASE_PORT
});


//multer setup
const storage = multer.diskStorage({
    destination : path.join(__dirname,"../product_images/"),
    filename    : function(req, file, cb){
	cb(null, UserId+"_"+file.originalname);
	ImagePath = `/${UserId}_${file.originalname}`;
    }
});

//multer initialize upload
const upload = multer({
    storage : storage,
    limits  : {fileSize : 10000000}
}).single("productImage");


//post /data route
Route.post('/data', (req, res)=>{

    upload(req, res, (err)=>{
	if(err) console.log("ERROR    : ",err.name , err.message);
	else{
	    const {productName, productDescription, productLocation, productPrice} = req.body;
	    
	    pool.getConnection((err,con)=>{

		con.query("INSERT INTO products(user_id,product_name,description,location,price,image_path) VALUES(?,?,?,?,?,?)",[UserId, productName, productDescription, productLocation, productPrice, ImagePath],(err,result)=>{
		    if(err) console.log("ERROR    : ",err.name, err.message);
		    else console.log("RESPONSE : product added in database successfully");
		})

		con.release();
		//con
	    });

	    res.render("productResponse.ejs",{
		title : "Product Added!",
		message : "product added",
		backNumber : -2
	    })
	}
    });
});


module.exports = Route;
