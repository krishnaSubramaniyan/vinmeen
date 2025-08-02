const express = require("express");
const Route   = express.Router();
const mysql   = require("mysql");

//pool
const pool = mysql.createPool({
    host     : process.env.DB_HOSTNAME,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port     : process.env.DB_PORT
});


// view product route
Route.get('/:productId', (req, res)=>{

    pool.getConnection((err, con)=>{

	if(err) console.log("ERROR    : ",err.name,err.message);
	else{
	    con.query("SELECT * FROM products where product_id=?",[req.params.productId],(err, result)=>{
		console.log("RESPONSE : viewProduct page are render");
		res.render("viewProduct.ejs", {product : result[0]});
		
	    }); // query
	}
	
    });	// mysql connection
    
}); // get route



//exports
module.exports = Route;
