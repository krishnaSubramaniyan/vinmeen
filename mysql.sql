create database if not exists vinmeen;
use vinmeen;

create table users(
user_id int auto_increment primary key,
user_name varchar(20) not null,
email varchar(60) unique,
password varchar(60) not null
);


create table products(
user_id int not null,
product_id int auto_increment primary key,
product_name varchar(30) not null,
description varchar(200) not null,
location varchar(50) not null,
price int not null,
image_path varchar(100) not null,
foreign key(user_id) references users(user_id)
);


create index search_product_index on products(product_name);
