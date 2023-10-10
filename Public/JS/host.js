var interval;
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const playerid = document.getElementById("playerID");
playerid.addEventListener("click", () => {
  console.log("clicked");
});
function start(value) {
  clearInterval(interval);
  interval = setInterval(() => {
    // console.log('myEvent')
    socket.emit("video-status-update", {
      serverId: serverId,
      status: value === undefined ? 2 : value.data,
      time: player.getCurrentTime(),
    });
  }, 5000);
}
function end() {
  clearInterval(interval);
}
function set(value) {
  //console.log('called')
  if (value && value.data === 2) {
    // console.log('cleared')
    end();
  } else {
    start(value);
  }
}

const socket = io();
let active = sessionStorage.getItem("active")
  ? sessionStorage.getItem("active")
  : false;
const host = true;
//try to connect user on every refresh
socket.emit("connect-user", {
  username: username,
  serverId: serverId,
  host: true,
});
//listen for success event
socket.on("success", (data) => {
  if (serverId === data.serverId)
    sessionStorage.setItem("videoId", data.videoId);
});
// set event on disconnect button
const disconnectBtn = document.getElementById("disconnect");
disconnectBtn.addEventListener("click", (e) => {
  console.log("okc");
  socket.emit("disconnectUser", { username: username, serverId: serverId });
  sessionStorage.clear();
  window.location.href = "/logout";
});

//add profile
const profile_icon = document.getElementById("profile_icon");
const profile_name = document.getElementById("profile_name");
profile_icon.innerHTML = username[0].toUpperCase();
profile_name.innerHTML = username;

window.addEventListener("visibilitychange", (e) => {
  document.visibilityState === "visible"
    ? socket.emit("update-status", {
        username: username,
        videoId: videoid,
        serverId: serverId,
        status: true,
      })
    : socket.emit("update-status", {
        username: username,
        videoId: videoid,
        serverId: serverId,
        status: false,
      });
});
//delete user when they go back or try to  refresh
window.onunload = function (e) {
  // Cancel the event
  e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
  // Chrome requires returnValue to be set
  socket.emit("disconnectUser", { username: username, serverId: serverId });
};

//get video id url
var videoURLForm = document.getElementById("videoUrl");

if (serverId !== sessionStorage.getItem("serverId")) {
  videoid = "";
  sessionStorage.setItem("serverId", serverId);
  sessionStorage.removeItem("videoId");
}

videoid = sessionStorage.getItem("videoId")
  ? sessionStorage.getItem("videoId")
  : ""; //will retreive information when page refreshes

document.getElementById("myInput").value = serverId;
//set to always scroll bottom of chat pannel

//get url from url search form
function findVideoId(url) {
  //   var len = url.length;
  var result = "";
  if (url.includes("shorts")) result = url.split("/")[4];
  else result = url.split("/")[3];
  result = result.split("?")[0];
  return result;
}
videoURLForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //console.log(e);
  const url = e.target.elements.videoIdTag.value;
  // console.log(url)
  const videoid = findVideoId(url);
  //  console.log(videoid);
  socket.emit("change-url", {
    username: username,
    videoId: videoid,
    serverId: serverId,
  });
  sessionStorage.setItem("videoId", videoid);
});

socket.on("chat request", (data) => {
  const chat =
    sessionStorage.getItem("messages") === null
      ? []
      : JSON.parse(sessionStorage.getItem("messages"));
  //  console.log('receip')
  socket.emit("chat history", { id: data.socketid, chat });
});

//when URL is changes
socket.on("change-url", (data) => {
  if (data.serverId === serverId) {
    player.loadVideoById(data["videoId"]);
    sessionStorage.setItem("videoid", data.videoId);
  }
});
//update the video status of everyone connected to server

//send message
const submit = document.getElementById("submit");
//const msgform = document.getElementById("msg-form");
//formate time
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
// ---
// listen to events
submit.addEventListener("click", (e) => {
  e.preventDefault();
  const chatbox = document.getElementById("chat-panel-id");
  const statusbox = document.getElementById("status-panel-id");
  statusbox.classList.add("hide");
  chatbox.classList.remove("hide");
  status.classList.remove("tray_section_visible");
  chat.classList.add("tray_section_visible");
  const msg = document.getElementById("msg-form").value;
  //console.log(msg);
  if (msg === "") return;
  socket.emit("msgform", {
    msg,
    serverId: serverId,
    username: username,
    time: formatAMPM(new Date()),
  });
  document.getElementById("msg-form").value = "";
});
// ----

//Display Message
function outputMsg(msg) {
  //console.log(msg.msg);
  const p = document.createElement("p");
  p.classList.add("messagewraper");
  p.innerHTML = `<span class='userInfo'>${msg.username}
        <span class='time'>${msg.time}</span>
        </span>
         <p class ='message'>${msg.msg}</p>
        `;
  document.querySelector(".chatboxWraper").appendChild(p);
  var element = document.getElementById("chat-panel-id");
  element.scrollTop = element.scrollHeight;
}
// event listener to view chat
chat.addEventListener("click", (e) => {
  const messages = JSON.parse(sessionStorage.getItem("messages"));
  //console.log(sessionStorage.getItem('messages'))
  const chatbox = document.getElementById("chat-panel-id");
  const statusbox = document.getElementById("status-panel-id");
  status.classList.remove("tray_section_visible");
  chat.classList.add("tray_section_visible");
  statusbox.classList.add("hide");
  chatbox.classList.remove("hide");
  chatbox.innerHTML = "";
  if (messages !== null)
    messages.forEach((msg) => {
      outputMsg(msg);
    });
});
//event listener to view online/offline status and all connected user

status.addEventListener("click", (e) => {
  const chatbox = document.getElementById("chat-panel-id");
  const statusbox = document.getElementById("status-panel-id");
  chatbox.classList.add("hide");
  statusbox.classList.remove("hide");
  status.classList.add("tray_section_visible");
  chat.classList.remove("tray_section_visible");
  statusbox.innerHTML = "";
  const connected = JSON.parse(sessionStorage.getItem("connected"));
  statusbox.innerHTML = "";
  connected.forEach((user) => {
    outputStatus(user);
  });
});

//listen for Message
window.addEventListener("load", (e) => {
  //load all messages
  const messages = sessionStorage.getItem("messages")
    ? JSON.parse(sessionStorage.getItem("messages"))
    : [];

  const chatbox = document.getElementById("chat-panel-id");
  chat.classList.add("tray_section_visible");
  socket.emit("update-status", {
    username: username,
    videoId: videoid,
    serverId: serverId,
    status: true,
  });

  chatbox.innerHTML = "";
  messages.forEach((msg) => {
    outputMsg(msg);
  });
});

socket.on("message", (msg) => {
  if (msg.serverId === serverId) {
    const chatbox = document.getElementById("chat-panel-id");
    const statusbox = document.getElementById("status-panel-id");
    chatbox.classList.remove("hide");
    statusbox.classList.add("hide");
    if (sessionStorage.getItem("messages") === null) {
      const messages = [];
      messages.push(msg);
      sessionStorage.setItem("messages", JSON.stringify(messages));

      outputMsg(msg);
      // console.log('set success')
      return;
    }
    var messages = JSON.parse(sessionStorage.getItem("messages"))
      ? JSON.parse(sessionStorage.getItem("messages"))
      : [];
    messages.push(msg);
    sessionStorage.setItem("messages", JSON.stringify(messages));
    outputMsg(msg);
  }
});

function outputStatus(user) {
  const chatbox = document.getElementById("chat-panel-id");
  const statusbox = document.getElementById("status-panel-id");
  const p = document.createElement("p");
  p.classList.add("statuswraper");
  Span = document.createElement("span");
  if (user.online === true) {
    Span.innerHTML = `<img src="../img/circle-16.png" alt="" class='image' />`;
  } else {
    Span.innerHTML = `<img src="../img/red.jpg" alt="" class='image' />`;
  }
  Span_ = document.createElement("span");
  Span_.innerHTML = `<span class='userInfo'>${user.username}</span>`;
  p.appendChild(Span);
  p.appendChild(Span_);
  document.querySelector(".statusboxWraper").appendChild(p);
  var element = document.getElementById("chat-panel-id");
  element.scrollTop = element.scrollHeight;
}

//console.log(active)
//list all connected users
socket.emit("connected-user", { serverId: serverId });
socket.on("update-connected-user", (data) => {
  //  console.log(data.length);
  if (data.length !== 0 && data[0].serverId === serverId) {
    sessionStorage.setItem("connected", JSON.stringify(data));
    const statusbox = document.getElementById("status-panel-id");
    statusbox.innerHTML = "";
    data.forEach((user) => {
      outputStatus(user);
    });
  }
});
