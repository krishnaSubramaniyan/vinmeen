const express = require("express");
const Route   = express.Router();
const mysql   = require("mysql");

//pool
const pool = mysql.createPool({
    host     : process.env.HOSTNAME,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD,
    database : process.env.DATABASE_NAME
});

// slash route
Route.get('/:userId',(req, res)=>{

    pool.getConnection((err,con)=>{

	if(err) console.log("ERROR    : ",err.name,err.message);
	else{
	    con.query("SELECT product_id,product_name,image_path FROM products WHERE user_id=?",[req.params.userId],(err,result)=>{
		if(result.length == 0){
		    res.render("response.ejs",{
			title:"No Product Added",
			message:"You haven't added any product!"
		    });
		}
		else{
		    res.render("listProduct.ejs",{listProduct:result});
		    console.log("RESPONSE : render listProudct page");
		}
	    }); // query
	}
	con.release();
    });// get connection
    
});	// get route


//edit product route
Route.get('/editproduct/:productId',(req,res)=>{

    pool.getConnection((err,con)=>{

	if(err) console.log("ERROR    : ",err.name,err.message);
	else{
	    con.query("SELECT product_id,product_name,description,location,price FROM products WHERE product_id=?",[req.params.productId],(err,result)=>{
		if(err) console.log("ERROR    : ",err.name,err.message);
		else{
		    res.render("editProduct.ejs",{ productData : result[0] });
		    console.log("RESPONSE : editProduct are render");
		}
	    }); // query
	}
	con.release();
    }); // get connection
}); //get route


//update product data
Route.post("/editproduct/data/:productId",(req, res)=>{

    const {productName,productDescription,productLocation,productPrice} = req.body;
    
	pool.getConnection((err,con)=>{

	    if(err) console.log("ERROR    : ",err.name,err.message);
	    else{
		con.query("UPDATE products SET product_name=?,description=?,location=?,price=? WHERE product_id=?",[productName,productDescription,productLocation,productPrice,req.params.productId],(err,result)=>{

		    if(err) console.log("ERROR    : ",err.name,err.message);
		    else{
			res.render("productResponse.ejs",{
			    title : "Product Updated",
			    message : "product updated",
			    backNumber : -2
			});
		    }
		}); // query
	    }
	    con.release();
	}); //get connection
}); // post route


//delete product route
Route.get("/delete/:productId",(req,res)=>{

    pool.getConnection((err,con)=>{

	if(err) console.log("ERROR    : ",err.name,err.message);
	else{
	    con.query("DELETE FROM products WHERE product_id=?",[req.params.productId],(err,result)=>{
		res.render("productResponse.ejs",{
		    title : "Product deleted",
		    message : "Product deleted",
		    backNumber : -1
		})
	    }); //query
	}
    }); //get connetion
    
}); //delete route



//exports Routes
module.exports = Route;
