let mongoose = require("mongoose");
let autoIncrement = require("mongoose-auto-increment");

// 用户
let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },

    created_date: { type: Date, default: Date.now }
});

userSchema.plugin(autoIncrement.plugin, { model: "User", startAt: 1 });
module.exports = (conn) => conn.model("User", userSchema);
