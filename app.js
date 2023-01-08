const express = require("express")
const mongoose = require("mongoose")
const fs = require("fs")
const path = require("path")
const multer = require("multer")
const imageModel = require("./model/Image")
require("dotenv").config()

const app = express()

//Connect mongoose
mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true})
const db = mongoose.connection

db.on("error", (error)=> console.error(error))
db.once("open", ()=> console.log("Database connection successful"))

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.set("view engine", "ejs")

var storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads")
    },
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + "-" + Date.now())
    }
})

var upload = multer({storage: storage})

app.get("/", (req, res)=>{
    imageModel.find({}, (err, items)=>{
        if(err){
            console.error(err)
            res.status(500).send({error: err})
        }else{
            res.render("imagesPage", {items: items})
        }
    })
})

app.post("/", upload.single("image"), (req, res, next)=>{
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + "/uploads/"+
            req.file.filename)),
            contentType: "image/png"
        }
    }
    imageModel.create(obj, (err, item)=>{
        if(err) console.error(err)
        else res.redirect("/")
    })  
})

var port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log("server running")
})
