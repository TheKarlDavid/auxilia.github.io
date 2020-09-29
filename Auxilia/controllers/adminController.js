const Admin = require('../models/admin')
const Task = require('../models/tasks')
const Meditation = require('../models/meditation')
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcryptjs")

//home page

exports.getIndex = (req, res)=>{

    if(req.session.email){
        //admin already signed in
        Task.find({}).then((docs)=>{
            res.render("home-admin.hbs", {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                tasks: docs 
            })
        }, (err)=>{
            res.render("home-admin.hbs",{
                error: err
            })
        })
    }

    else{
        // the admin has not logged
        res.render("index.hbs")
    
    }

}

exports.getLogin = async (req,res)=>{
    let email = req.body.email
    let password = req.body.password
    let remember_me = req.body.remember

    var admin = await Admin.findOne({ email: email }).exec();
    if(!admin) {
        res.render("login.hbs", {
            errors:"Invalid email/password" 
        })
    }
    if(!bcrypt.compareSync(password, admin.password)) {
        console.log(password)
        console.log(admin.password)

        res.render("login.hbs", {
            errors:"Invalid email/password" 
        })
    }
    else{
        req.session.email = req.body.email
        req.session.password = req.body.password
        req.session.firstname = admin.firstname
        req.session.lastname = admin.lastname

        if(remember_me){    
            req.session.cookie.maxAge = 1000 * 3600 * 24 * 30
        }
            res.redirect("/")
    }
    
}

exports.getLoginRegister = (req, res)=>{

    if(req.session.email){
        res.render("home-admin.hbs",{
            firstname: req.session.firstname,
            lastname: req.session.lastname
        })
    }

    else{
        res.render("login.hbs")
    }
}

exports.getHome = (req, res)=>{

    if(req.session.email){
        res.redirect("/")
    }

    else{
        res.render("index.hbs")
    }
}

exports.getEditTask = (req, res)=>{
    
    let task = req.body.task
    let id = req.body.edit_id
    
    console.log(task)

    if(req.session.email){
        Task.findOneAndUpdate({
            _id:id
        }, {
            task_description: task
        }).then(()=>{
            res.redirect("/")
        }, (error)=>{ 
            Task.find({}).then((docs)=>{
                res.render("home-admin.hbs", {
                    error: error,
                    firstname: req.session.firstname,
                    lastname: req.session.lastname,
                    tasks: docs 
                })
            })
        })
    }

    else{
        res.render("login.hbs") 
    }

}

exports.getMeditation = (req, res)=>{

    if(req.session.email){
        Meditation.find({}).sort({date: 'desc'}).then((docs)=>{
            res.render("meditation-admin.hbs", {
                meditations: docs
            })
        }, (err)=>{
            res.render("meditation-admin.hbs",{
                error: err
            })
        })
    }

    else{
        res.render("login.hbs") 
    }
}

exports.getAddMeditation = (req, res)=>{
    
    let title = req.body.add_title
    let desc = req.body.add_desc
    let link = req.body.add_link
    let date = Date.now()

    if(req.session.email){
        let meditation = new Meditation({
            title: title,
            description: desc,
            link: link,
            date: date
        })

        meditation.save().then((doc)=>{
            res.redirect("/meditation")
        }, (error)=>{ 
            Meditation.find({}).sort({date: 'desc'}).then((docs)=>{
                res.render("meditation-admin.hbs", {
                    error: error,
                    meditations: docs
                })
            })
        })
    }

    else{
        res.render("login.hbs") 
    }

}

exports.getEditMeditation = (req, res)=>{

    let id = req.body.edit_id
    let title = req.body.edit_title
    let desc = req.body.edit_desc
    let link = req.body.edit_link

    if(req.session.email){
        Meditation.findOneAndUpdate({
            _id:id
        }, {
            title: title,
            description: desc,
            link: link
        }).then(()=>{
            res.redirect("/meditation")
        }, (error)=>{ 
            Meditation.find({}).sort({date: 'desc'}).then((docs)=>{
                res.render("meditation-admin.hbs", {
                    error: error,
                    meditations: docs
                })
            })
        })
    }

    else{
        res.render("login.hbs") 
    }
}

exports.getDeleteMeditation = (req, res)=>{

    console.log(req.body.delete_id)
    let id = req.body.delete_id

    if(req.session.email){
        Meditation.deleteOne({
            _id:id
        }).then(()=>{
            res.redirect("/meditation")
        }, (error)=>{ 
            Meditation.find({}).sort({date: 'desc'}).then((docs)=>{
                res.render("meditation-admin.hbs", {
                    error: error,
                    meditations: docs
                })
            })
        })
    }

    else{
        res.render("login.hbs") 
    }
}

exports.getAbout = (req, res)=>{

    if(req.session.email){
        res.render("about-admin.hbs")
    }

    else{
        res.render("about-not.hbs") 
    }
}

exports.getProfile = (req, res)=>{

    if(req.session.email){
        res.render("profile-admin.hbs",{
            firstname: req.session.firstname,
            lastname: req.session.lastname
        })
    }

    else{
        res.render("login.hbs") 
    }
}

exports.getSignout = (req,res)=>{
    req.session.destroy()
    res.redirect("/")
}