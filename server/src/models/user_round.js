let mongoose = require("mongoose");
let autoIncrement = require("mongoose-auto-increment");

// 用户发起的一次和其他所有人的对战
let userRoundSchema = new mongoose.Schema({
    user: { // 发起人
        type: Number,
        ref: "User",
        required: true
    },

    battles: {
        type: [{
            type: Number,
            ref: "User",
            required: true
        }],
        required: true,
        default: []
    },

    finished_battle_cnt: {
        type: Number,
        required: true,
        default: 0
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },

    created_date: { type: Date, default: Date.now }
});

userRoundSchema.plugin(autoIncrement.plugin, { model: "UserRound", startAt: 1 });
module.exports = (conn) => conn.model("UserRound", userRoundSchema);
