const mongoose = require("mongoose");

const Server = new mongoose.Schema({
    serverId: {
        type: String,
        require: true,
        default: ''
    },
    videoId: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    username: {
        type: String,
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
