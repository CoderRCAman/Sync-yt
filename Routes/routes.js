const express = require('express');
const Router = express.Router();
const Server = require('../Models/Server');
const Videoid = require('../Models/Videoid');
const querystring = require('querystring');
const { render } = require('ejs');
const { log } = require('console');

//GET Routes
Router.get('/', (req, res) => {
    res.render('index');
})
//load host 
Router.get('/loadhost', (req, res) => {
    res.render('Host/HostLogForm', { error: "" });
})
//load user
Router.get('/loaduser', (req, res) => {
    res.render('User/UserLogForm', { error: '' });
})

Router.get('/hostview', (req, res) => {
    res.render('Host/HostView')
})

Router.get('/userview', (req, res) => {
    res.render('User/UserView')
})

Router.get('/signup', (req, res) => {
    res.render('Signup', { error: '' });
})

// POST Routes 
// load host view page
Router.post('/loadhost', async (req, res) => {
    console.log(req.body);
    const { username, serverId, password } = req.body;
    try {
        const validate = await Server.findOne({ 'username': username });
        if (!validate) {
            return res.render('Host/HostLogForm', { error: "Username Doesn't Exist" });
        }
        else {

            if (password !== validate.password) {
                return res.render('Host/HostLogForm', { error: "Password Didn't Match" });
            }
            console.log(validate.serverId)
            if (validate.serverId === "") {
                console.log('got it');
                validate.serverId = serverId;
                validate.videoId = 'M7lc1UVf-VE';
                validate.host = true;
            }

            else {
                return res.render('Host/HostLogForm', { error: "You are already in a stream" });
            }

            // const newHost = new Server({
            //     'username': username,
            //     'serverId': serverId,
            //     'videoId': 'M7lc1UVf-VE',
            //     'host': true
            // }).save(); 
            validate.save()
                .then((user) => { console.log(user) })
                .catch(err => { console.log(err); })
            new Videoid({
                'serverId': serverId,
                'videoId': 'M7lc1UVf-VE',
            }).save();

            const query = querystring.stringify({
                "username": username,
                "serverId": serverId,
                "videoId": 'M7lc1UVf-VE'
            })

            res.redirect('/hostview/?' + query);
        }
    } catch (error) {
        console.log(error);
    }

})
// load user view page 

Router.post('/loaduser', async (req, res) => {
    // console.log(req.body);
    const { username, serverId, password } = req.body;
    try {
        const newVideoSouce = await Videoid.findOne({ 'serverId': serverId });
        const validate = await Server.findOne({ 'username': username });
        if (validate) {
            if (password !== validate.password) return res.render('User/UserLogForm', { error: 'Password did not match' });
        }
        else {
            return res.render('User/UserLogForm', { error: 'Username Doesnot Exist' });
        }
        if (!newVideoSouce) {
            return res.render('User/UserLogForm', { error: 'Invalid Server Id' });
        }
        else {
            validate.serverId = serverId;
            validate.host = false;
            validate.save()
                .then(user => { console.log('success') })
                .catch(err => { console.log(err) })
            const query = querystring.stringify({
                "username": username,
                "serverId": serverId,
                "videoId": newVideoSouce.videoId
            })

            res.redirect('/userview/?' + query);
        }
    } catch (error) {
        console.log(error);
    }

})

Router.post('/signup', async (req, res) => {
    const host = req.query.host;
    console.log(host)
    const { username, password } = req.body;
    try {
        const validate = await Server.findOne({ username });
        if (!validate) {
            new Server(req.body).save()
                .then(user => {
                    // console.log(user)
                    if (host === 'true') return res.redirect('/loadhost');
                    return res.redirect('/loaduser');
                })
                .catch(err => log(err))
        }
        else {
            return res.render('Signup', { error: 'Already Exist' })
        }

    } catch (error) {

    }

})

module.exports = Router;