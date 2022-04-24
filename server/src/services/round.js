let { User, AI, Battle, UserRound } = require("../models");
let assert = require("assert");

exports.CreateUserRound = async (user) => {
    let user_ai = await AI.findOne({ user }).sort("-_id");
    assert(user_ai, "没有上传AI不能发起对战");

    let last_user_round = await UserRound.findOne({ user }).sort("-_id");
    assert(!last_user_round || last_user_round.finished, "上一场对局还未结束，不能发起下一场");

    let other_ais = [];
    for (let other of await User.find()) {
        if (user._id == other._id) continue;
        let other_ai = await AI.findOne({ user: other }).sort("-_id");
        if (!other_ai) continue;
        other_ais.push(other_ai);
    }
    assert(other_ais.length > 0, "暂时没有其他人提交AI");

    let battle_ids = [];
    for (let other_ai of other_ais) {
        let battle = await Battle.create({
            ai1: user_ai,
            ai2: other_ai
        });
        battle_ids.push(battle._id);
    }

    let user_round = await UserRound.create({
        user,
        battles: battle_ids,
    });
    await Battle.updateMany({ _id: { $in: battle_ids } }, { $set: { user_round } });
};
