let mongoose = require("mongoose");
let autoIncrement = require("mongoose-auto-increment");

// 两两对战
let battleRoundSchema = new mongoose.Schema({
    ais: { // 参与对战的AI列表
        type: [{
            type: Number,
            ref: "AI",
            required: true
        }],
        required: true,
        default: []
    },
    battles: {
        type: [{
            type: Number,
            ref: "Battle",
            required: true
        }],
        required: true,
        default: []
    },

    scores: { // ai_id => score
        type: Object,
        required: true
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

battleRoundSchema.plugin(autoIncrement.plugin, { model: "BattleRound", startAt: 1 });
module.exports = (conn) => conn.model("BattleRound", battleRoundSchema);
