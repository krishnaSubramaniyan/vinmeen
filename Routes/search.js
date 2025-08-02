const express = require("express");
const Route   = express.Router();
const mysql   = require("mysql");
const syncsql = require("sync-sql");


//pool
const pool = mysql.createPool({
    host     : process.env.DB_HOSTNAME,
    user     : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port     : process.env.DB_PORT
});


//search route
Route.get('/', (req, res)=>{

    const search = req.query.search.toLowerCase().trim();

    console.log("REQUEST  : user query",search);
    //get mysql connection
    pool.getConnection((err,con)=>{

	if(err) console.log("ERROR    : ",err.name, err.message);
	else{

	    //specific product search
	    con.query("SELECT product_id, product_name, description, image_path FROM products WHERE product_name=?",[search],(err,result)=>{
		if(err) console.log("ERROR    : ",err.name, err.message);
		else{

		    //specific search response
		    if(result.length > 0 ){
			res.render("searchProduct.ejs",{
			    searchProduct : search,
			    productList   : result
			});
			console.log("RESPONSE : specific search run");
		    }
		    else{

			//run enhance search
			const split = search.split(" ");
			var productList = [];
			var products = [];
			for(let i=0; i<split.length; i++){
			    const result = syncsql.mysql({
				host     : process.env.DB_HOSTNAME,
				user     : process.env.DB_USERNAME,
				password : process.env.DB_PASSWORD,
				database : process.env.DB_NAME,
				port     : process.env.DB_PORT
			    },"select * from products where product_name like ?", ["%"+split[i]+"%"]);
			    productList.push(...result.data.rows);
			}

			//remove duplications
			productList.forEach((item)=>{
			    let exists = false;
			    for(let i=0; i<products.length; i++){
				if(products[i].product_id == item.product_id){
				    exists = true;
				    break;
				}
			    }
			    if(!exists){
				products.push(item);
			    }
			});

			//product not found response
			if(products.length == 0){
			    res.render("response.ejs",{
				title   : "Product Not Found",
				message : "sorry product not found!"
			    });
			    console.log("RESPONSE : Product Not Found");
			}
			else{
			    res.render("searchProduct.ejs",{
				searchProduct : search,
				productList   : products
			    });
			    console.log("RESPONSE : enhance search page render");
			}
		    }
		}
	    });
	}

	con.release();
    });
});




//exports module
module.exports = Route;
