const mongoose = require("mongoose");

const Videoid = new mongoose.Schema({
    serverId: {
        type: String,
        require: true,
    },
    videoId: String,

})

module.exports = mongoose.model("Videoid", Videoid);
