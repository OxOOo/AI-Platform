let mongoose = require("mongoose");
let autoIncrement = require("mongoose-auto-increment");

// 用户上传的一个AI
let aiSchema = new mongoose.Schema({
    user: {
        type: Number,
        ref: "User",
        required: true
    },

    code: {
        type: String,
        required: true,
        maxLength: 1024 * 1024
    },

    created_date: { type: Date, default: Date.now }
});

aiSchema.plugin(autoIncrement.plugin, { model: "AI", startAt: 1 });
module.exports = (conn) => conn.model("AI", aiSchema);
