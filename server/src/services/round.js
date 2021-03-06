let { User, AI, Battle, UserRound, BattleRound } = require("../models");
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

exports.CreateBattleRound = async () => {
    let users = await User.find();

    let ai_ids = [];
    for (let user of users) {
        let ai = await AI.findOne({ user }).sort("-_id");
        if (ai) {
            ai_ids.push(ai._id);
        }
    }
    assert(ai_ids.length > 1, "提交AI的用户不足2人");

    let battle_ids = [];
    for (let i = 0; i < ai_ids.length; i++) {
        for (let j = i + 1; j < ai_ids.length; j++) {
            let battle = await Battle.create({ ai1: ai_ids[i], ai2: ai_ids[j] });
            battle_ids.push(battle._id);
        }
    }

    let scores = {};
    for (let id of ai_ids) {
        scores[id] = 0;
    }

    let battle_round = await BattleRound.create({ ais: ai_ids, battles: battle_ids, scores });
    await Battle.updateMany({ _id: { $in: battle_ids } }, { $set: { battle_round } });
};

exports.BattleUpdate = async (battle) => {
    if (battle.user_round) {
        let user_round = await UserRound.findById(battle.user_round);
        user_round.finished_battle_cnt = await Battle.find({ _id: { $in: user_round.battles }, status: "finished" }).count();
        user_round.finished = user_round.finished_battle_cnt === user_round.battles.length;
        await user_round.save();
    }
    if (battle.battle_round) {
        let battle_round = await BattleRound.findById(battle.battle_round);
        battle_round.finished_battle_cnt = await Battle.find({ _id: { $in: battle_round.battles }, status: "finished" }).count();
        battle_round.finished = battle_round.finished_battle_cnt === battle_round.battles.length;

        let scores = {};
        for (let ai_id of battle_round.ais) {
            scores[ai_id] = 0;
        }
        for (let battle of await Battle.find({ _id: { $in: battle_round.battles }, status: "finished" })) {
            if (battle.pos.battle_result === "AI1_WIN") {
                scores[battle.ai1] += 2;
            } else if (battle.pos.battle_result === "AI2_WIN") {
                scores[battle.ai2] += 2;
            } else {
                scores[battle.ai1] += 1;
                scores[battle.ai2] += 1;
            }

            if (battle.rev.battle_result === "AI1_WIN") {
                scores[battle.ai2] += 2;
            } else if (battle.rev.battle_result === "AI2_WIN") {
                scores[battle.ai1] += 2;
            } else {
                scores[battle.ai1] += 1;
                scores[battle.ai2] += 1;
            }
        }
        battle_round.scores = scores;

        await battle_round.save();
    }
};
