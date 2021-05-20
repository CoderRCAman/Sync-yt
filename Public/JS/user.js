const socket = io();
const chat = document.getElementById('chat');
const status = document.getElementById('status');
socket.emit('connect-user', { 'username': username, 'serverId': serverId, 'host': false })
//listen for success user 
socket.on('success', data => {
    if (serverId === data.serverId) {
        sessionStorage.setItem('videoId', data.videoId);
        // socket.emit('chat request', { id: data.socketid });
    }
})
let active = sessionStorage.getItem('active') ? sessionStorage.getItem('active') : false;
const host = false;
//add profile
const profile_icon = document.getElementById('profile_icon');
const profile_name = document.getElementById('profile_name');
const stream = document.getElementById('stream');
profile_icon.innerHTML = username[0].toUpperCase();
profile_name.innerHTML = username;

window.addEventListener('visibilitychange', (e) => {
    document.visibilityState === 'visible' ?
        socket.emit('update-status', { 'username': username, 'videoId': videoid, 'serverId': serverId, 'status': true })
        : socket.emit('update-status', { 'username': username, 'videoId': videoid, 'serverId': serverId, 'status': false })
})

// set event on disconnect button 
const disconnectBtn = document.getElementById('disconnect');
disconnectBtn.addEventListener('click', (e) => {
    socket.emit('disconnectUser', { 'username': username, 'serverId': serverId });
    sessionStorage.clear();
    window.location.href = '/'
})
//get video Id from session storage 
videoid = sessionStorage.getItem('videoId') ? sessionStorage.getItem('videoId') : videoId;
//check if that username is valid  
socket.emit('validateuser', username);
socket.on('change-url', data => {
    if (serverId === data.serverId) {
        player.loadVideoById(data['videoId']);
        sessionStorage.setItem('videoId', data['videoId']);
    }
})


// update video status
socket.on('video-status-update', data => {
    active = sessionStorage.getItem('active') ? sessionStorage.getItem('active') : false;
    // console.log(active);
    if (player && serverId === data['serverId']) {
        //   console.log(data['time']);
        var diff = player.getCurrentTime() - data['time'];
        if (data['status'] === 2) player.pauseVideo();
        else if (data['status'] === 1) player.playVideo();
        if (diff > 1 || diff < -1) {
            player.seekTo(data['time']);
        }
    }
})

//Handle Chat 
const submit = document.getElementById("submit");
//const msgform = document.getElementById("msg-form");
//formate time 
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
// --- 
// listen to events 
submit.addEventListener('click', (e) => {
    e.preventDefault();
    const chatbox = document.getElementById('chat-panel-id');
    const statusbox = document.getElementById('status-panel-id');
    statusbox.classList.add('hide');
    chatbox.classList.remove('hide');
    status.classList.remove('tray_section_visible');
    chat.classList.add('tray_section_visible');
    const msg = document.getElementById('msg-form').value;
    //console.log(msg);
    if (msg === '') return
    socket.emit('msgform', { msg, 'serverId': serverId, 'username': username, time: formatAMPM(new Date()) });
    document.getElementById('msg-form').value = '';
})
// ---- 
//Display Message 
function outputMsg(msg) {
    const p = document.createElement('p');
    p.classList.add('messagewraper');
    p.innerHTML =
        `<span class='userInfo'>${msg.username}
        <span class='time'>${msg.time}</span>
        </span>
         <p class ='message'>${msg.msg}</p>
        `
    document.querySelector('.chatboxWraper').appendChild(p);
    var element = document.getElementById("chat-panel-id");
    element.scrollTop = element.scrollHeight;
}
// event listener to view chat  

chat.addEventListener('click', (e) => {
    const messages = sessionStorage.getItem('messages') !== 'undefined' ? JSON.parse(sessionStorage.getItem('messages')) : [];
    //console.log(sessionStorage.getItem('messages'))
    const chatbox = document.getElementById('chat-panel-id');
    const statusbox = document.getElementById('status-panel-id');
    statusbox.classList.add('hide');
    chatbox.classList.remove('hide');
    status.classList.remove('tray_section_visible');
    chat.classList.add('tray_section_visible');
    chatbox.innerHTML = ''
    messages.forEach(msg => {
        outputMsg(msg)
    });
})
//event listener to view online/offline status and all connected user

status.addEventListener('click', e => {
    const chatbox = document.getElementById('chat-panel-id');
    const statusbox = document.getElementById('status-panel-id');
    chatbox.classList.add('hide');
    statusbox.classList.remove('hide');
    statusbox.innerHTML = '';
    status.classList.add('tray_section_visible');
    chat.classList.remove('tray_section_visible');
    const connected = JSON.parse(sessionStorage.getItem('connected'));
    statusbox.innerHTML = ''
    connected.forEach(user => {
        outputStatus(user);
    })

})

//listen for Message  
window.addEventListener('load', (e) => {
    //load all messages  
    //console.log(sessionStorage.getItem('messages'))
    const messages = sessionStorage.getItem('messages') !== 'undefined' ? JSON.parse(sessionStorage.getItem('messages')) : [];
    // status.classList.remove('tray_section_visible');
    chat.classList.add('tray_section_visible');
    //console.log(sessionStorage.getItem('messages'))
    const chatbox = document.getElementById('chat-panel-id')
    socket.emit('update-status', { 'username': username, 'videoId': videoid, 'serverId': serverId, 'status': true })
    chatbox.innerHTML = ''
    messages.forEach(msg => {
        outputMsg(msg)
    });
})

socket.on('message', (msg) => {

    if (msg.serverId === serverId) {
        const chatbox = document.getElementById('chat-panel-id');
        const statusbox = document.getElementById('status-panel-id');
        chatbox.classList.remove('hide');
        statusbox.classList.add('hide');
        if (sessionStorage.getItem('messages') === null) {
            const messages = [];
            messages.push(msg);
            sessionStorage.setItem('messages', JSON.stringify(messages));

            outputMsg(msg);
            // console.log('set success')
            return;
        }
        const messages = sessionStorage.getItem('messages') !== 'undefined' ? JSON.parse(sessionStorage.getItem('messages')) : [];
        messages.push(msg);
        sessionStorage.setItem('messages', JSON.stringify(messages));
        outputMsg(msg)

    }

})

function outputStatus(user) {
    const chatbox = document.getElementById('chat-panel-id');
    const statusbox = document.getElementById('status-panel-id');
    const p = document.createElement('p');
    p.classList.add('statuswraper');
    Span = document.createElement('span');
    if (user.online === true) {
        Span.innerHTML = `<img src="../img/circle-16.png" alt="" class='image' />`
    }
    else {
        Span.innerHTML = `<img src="../img/red.jpg" alt="" class='image' />`
    }
    Span_ = document.createElement('span');
    Span_.innerHTML = `<span class='userInfo'>${user.username}</span>`
    p.appendChild(Span);
    p.appendChild(Span_);
    document.querySelector('.statusboxWraper').appendChild(p);
    var element = document.getElementById("chat-panel-id");
    element.scrollTop = element.scrollHeight;
}


//console.log(active)
//list all connected users  
socket.emit('connected-user', { 'serverId': serverId });
socket.on('update-connected-user', data => {
    //  console.log(data);
    if (data[0].serverId === serverId) {
        sessionStorage.setItem('connected', JSON.stringify(data));

        //if (isLogedOut()) window.location.href = '/'
        const statusbox = document.getElementById('status-panel-id');
        statusbox.innerHTML = ''
        data.forEach(user => {
            flag = user.username === username
            outputStatus(user);
        })
    }
})

socket.on('update chat', data => {
    if (data.id === socket.id) {
        sessionStorage.setItem('messages', JSON.stringify(data.chat));
        const messages = sessionStorage.getItem('messages') !== 'undefined' ? JSON.parse(sessionStorage.getItem('messages')) : [];
        messages.forEach(msg => {
            outputMsg(msg)
        })
    }
})
// window.addEventListener('beforeunload', function (e) {
//     // Cancel the event
//     e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
//     // Chrome requires returnValue to be set
//     socket.emit('disconnectUser', { 'username': username, 'serverId': serverId });
// });

window.onunload = function (e) {
    // Cancel the event
    e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    // Chrome requires returnValue to be set
    socket.emit('disconnectUser', { 'username': username, 'serverId': serverId });
}