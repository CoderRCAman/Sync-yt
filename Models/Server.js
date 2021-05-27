const mongoose = require("mongoose");

const Server = new mongoose.Schema({
    serverId: {
        type: String,
        require: true,
        trim:true ,
        default: ''
    },
    videoId: {
        type: String,
          trim:true ,
        default: ''
    },
    password: {
        type: String,
          trim:true ,
        default: ''
    },
    username: {
        type: String,
          trim:true ,
        require: true
    },
    host: {
        type: Boolean,
        default: false
    },
    online: {
        type: Boolean,
        default: true
    }

})

module.exports = mongoose.model("Server", Server);
