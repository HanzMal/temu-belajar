const express = require('express')
const app = express()
const port = 3000

const { Pool } = require('pg')
require("dotenv").config()
const {Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: console.log,
});

sequelize.authenticate()
.then(() => {
    console.log("Database Connected"); 
})
.catch((err) => {
    console.log("Failed Connect", err)
})