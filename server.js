require('dotenv').config();
const express = require('express'); //express lets us connect talk front and back end its a nodejs framwork
const socketio = require('socket.io');//enables real-time, bidirectional and event-based communication.
const http = require('http');//socket.io is in itself not a socket so we need http websockets to use as a transport
const app = express();
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);
const mongoose = require('mongoose');
const Routes = require('./Routes/routes');
var bodyParser = require('body-parser')

//set view engine 
app.set('view engine', 'ejs');
//make static folder  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './Public')))
//set our routes 
app.use('/', Routes);
//acquire model 
const Server = require('./Models/Server');
const Videoid = require('./Models/Videoid');
const { mapReduce } = require('./Models/Server');
//setting up database connection 
//const {saveServer,auth,deleteServer,findHost } = require('./Controllers/process');
const DBUrl = 'mongodb+srv://Server:1234@cluster0.0ychj.mongodb.net/Server?retryWrites=true&w=majority'
mongoose.connect(DBUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => console.log("DB Connected"))



//socket code
const user = new Map();
io.on('connection', socket => {
	console.log("connection made");
	socket.on('change-url', async data => {
		// Server.findOneAndUpdate({ 'serverId': data['serverId'] }, { $set:{ 'videoId': data['videoId'] }}, {
		// 	upsert : true 
		//  }, (err, response) => {
		// 		 if (err) console.log(err);
		// 		 else {
		// 			 
		// 	}
		// }) 
		try {
			//const host = await Server.findOneAndUpdate({ 'serverId': data['serverId'], 'host': true }, { $set: { 'videoId': data['videoId'] } });
			const newVideoSouce = await Videoid.findOneAndUpdate({ 'serverId': data['serverId'] }, { $set: { 'videoId': data['videoId'] } });
			if (newVideoSouce) {
				io.emit('change-url', { 'serverId': data['serverId'], 'videoId': data['videoId'] });
			}
		} catch (error) {
			console.log(error);
		}
	})
	//socket.on('ok', msg => { console.log(msg + "ultimage");socket.emit('ok',msg) });
	//check for confirmation
	socket.on('connected-user', async (data) => {
		try {
			const users = await Server.find({ 'serverId': data['serverId'] });
			if (users) {
				//console.log(users);
				io.emit('update-connected-user', users);
			}
		} catch (error) {
			console.log(error);
		}
	})
	//listen for video status change
	socket.on('video-status-update', data => {
		io.emit('video-status-update', data);
	})

	socket.on('update-status', async data => {

		//console.log(data.status)
		try {
			if (data.status === true) {
				//console.log('notok')
				var result = await Server.findOneAndUpdate({ 'username': data['username'] }, { online: true })
			}
			else {
				//	console.log('ok')
				var result = await Server.findOneAndUpdate({ 'username': data['username'] }, { online: false })
			}
			const users = await Server.find({ 'serverId': data['serverId'] });
			if (users) {
				//	console.log(users);
				io.emit('update-connected-user', users);
			}
		} catch (error) {
			console.log(error);
		}
	})
	//when user disconnects 
	//connect on page refresh  
	socket.on('chat history', data => {
		console.log(data)
		io.emit("update chat", data);
	})
	socket.on('connect-user', async (data) => {
		user.set(socket.id, data.username);
		//	console.log('called')
		try {
			const host = data.host ? true : false;
			const videoId = await Videoid.findOne({ 'serverId': data['serverId'] })
			socket.emit('success', {
				'username': data.username,
				'serverId': data.serverId,
				'videoId': videoId.videoId || 'M7lc1UVf-VE',
			})
			console.log('okd')
			const auser = await Server.findOneAndUpdate({ username: data.username }, { 'serverId': data.serverId })
			const users = await Server.find({ 'serverId': data['serverId'] });
			if (users) {
				io.emit('update-connected-user', users);
			}
			io.emit('chat request', { 'socketid': socket.id });
		} catch (err) {
			console.log(err);
		}
	})
	socket.on('disconnectUser', async (data) => {
		//TO DO  
		console.log('delete')
		const updatedUser = await Server.findOneAndUpdate({ username: data.username }, { serverId: '' })
		const users = await Server.find({ 'serverId': data['serverId'] });
		console.log(users)
		if (users) {
			io.emit('update-connected-user', users);
		}
	})
	socket.on('disconnect', async () => {
		const username = user.get(socket.id);
		const updatedUser = await Server.findOneAndUpdate({ username }, { serverId: '' })
		const users = await Server.find({ 'serverId': data['serverId'] });
		console.log(users)
		if (users) {
			io.emit('update-connected-user', users);
		}
		user.delete(socket.id)
	})
	//listen for message 
	socket.on('msgform', (msg) => {
		console.log('recv');
		io.emit('message', msg);
	})


})
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Application is Up and Running at port", PORT));