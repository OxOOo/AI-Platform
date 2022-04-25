let mongoose = require("mongoose");
let autoIncrement = require("mongoose-auto-increment");

// 两个AI之间进行一次对战，会交换先后手对战两次
let battleSchema = new mongoose.Schema({
    user_round: { // 是否是一场UserRound
        type: Number,
        ref: "UserRound"
    },

    ai1: {
        type: Number,
        ref: "AI",
        required: true
    },
    ai2: {
        type: Number,
        ref: "AI",
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ["pending", "running", "finished"],
        default: "pending"
    },

    pos: { // AI1指先手，和上面的ai1并不一定相同，下同
        ai1_compile_log: String,
        ai2_compile_log: String,
        moves: Object,
        error_txt: String,
        battle_result: {
            type: String,
            enum: ["AI1_WIN", "AI2_WIN", "TIE"]
        },
        battle_message: String,
    },
    rev: {
        ai1_compile_log: String,
        ai2_compile_log: String,
        moves: Object,
        error_txt: String,
        battle_result: {
            type: String,
            enum: ["AI1_WIN", "AI2_WIN", "TIE"]
        },
        battle_message: String,
    },

    created_date: { type: Date, default: Date.now }
});

battleSchema.plugin(autoIncrement.plugin, { model: "Battle", startAt: 1 });
module.exports = (conn) => conn.model("Battle", battleSchema);
