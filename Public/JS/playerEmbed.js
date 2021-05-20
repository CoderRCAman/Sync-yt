socket = io();
var tag = document.createElement('script');
var videoid = '';
var time = 0;
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var newuserconnected = false;
//  This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
//obtain server id from URL using QS library 


console.log(serverId)

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '480',
        width: '720',
        videoId: videoid ? videoid : 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.pauseVideo();
}



function onPlayerStateChange(event) {
    set(event)

    //console.log("state"); 
    if (host)
        socket.emit('video-status-update', {
            'serverId': serverId,
            'status': event.data,
            'time': player.getCurrentTime()
        });
    // time = player.getCurrentTime();

}
