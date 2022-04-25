// 主要功能区
let Router = require("koa-router");
let _ = require("lodash");
let auth = require("../services/auth");
let round = require("../services/round");
let { AI, UserRound } = require("../models");

const router = module.exports = new Router();

// 提交AI代码
// code
router.post("/ai/submit", auth.LoginRequired, async ctx => {
    let code = _.trim(ctx.request.body.code || "");
    ctx.assert(code, "代码为空");
    ctx.assert(code.length < 1024 * 1024, "代码太长");

    await AI.create({
        user: ctx.state.user,
        code
    });
    ctx.body = {
        success: true
    };
});

// AI列表,current=1&page_size=20
router.get("/ai/myais", auth.LoginRequired, async ctx => {
    let condition = { user: ctx.state.user };

    let total = await AI.find(condition).count();
    let current = parseInt(ctx.query.current || 1);
    current = Math.max(1, current);
    let page_size = parseInt(ctx.query.page_size || 20);
    page_size = Math.max(10, Math.min(100, page_size));
    let ais = await AI.find(condition).sort("-_id").skip((current - 1) * page_size).limit(page_size);

    ctx.body = {
        success: true,
        total,
        current,
        page_size,
        data: ais.map(x => {
            return {
                _id: x._id,
                created_date: x.created_date,
                code_length: x.code.length
            };
        })
    };
});

// 下载自己的AI，?ai_id
router.get("/ai/download", auth.LoginRequired, async ctx => {
    let ai = await AI.findById(ctx.query.ai_id);
    ctx.assert(ai, "参数错误");
    ctx.assert(ai.user == ctx.state.user._id, "只能下载自己的AI");

    ctx.body = {
        success: true,
        code: ai.code
    };
});

// 用户发起一次对战
router.post("/ai/create_user_round", auth.LoginRequired, async ctx => {
    await round.CreateUserRound(ctx.state.user);
    ctx.body = {
        success: true
    };
});

// 用户发起的对战列表,current=1&page_size=20
router.get("/user_rounds", auth.LoginRequired, async ctx => {
    let condition = {};

    let total = await UserRound.find(condition).count();
    let current = parseInt(ctx.query.current || 1);
    current = Math.max(1, current);
    let page_size = parseInt(ctx.query.page_size || 20);
    page_size = Math.max(10, Math.min(100, page_size));
    let user_rounds = await UserRound.find(condition).populate("user").sort("-_id").skip((current - 1) * page_size).limit(page_size);

    ctx.body = {
        success: true,
        total,
        current,
        page_size,
        data: user_rounds.map(x => {
            return {
                _id: x._id,
                user: _.pick(x.user, ["_id", "username", "nickname"]),
                battles: x.battles,
                finished_battle_cnt: x.finished_battle_cnt,
                finished: x.finished,
                created_date: x.created_date
            };
        })
    };
});

function pick_battle(battle) {
    return {
        _id: battle._id,
        ai1: {
            _id: battle.ai1._id,
            user: _.pick(battle.ai1.user, ["_id", "username", "nickname"])
        },
        ai2: {
            _id: battle.ai2._id,
            user: _.pick(battle.ai2.user, ["_id", "username", "nickname"])
        },
        status: battle.status,
        pos: _.pick(battle.pos, ["battle_result", "battle_message"]),
        rev: _.pick(battle.rev, ["battle_result", "battle_message"]),
        created_date: battle.created_date
    };
}

// 用户发起的对战, ?user_round_id
router.get("/user_round", auth.LoginRequired, async ctx => {
    let user_round = await UserRound.findById(ctx.query.user_round_id)
        .populate("user")
        .populate("battles")
        .populate("battles.ai1")
        .populate("battles.ai1.user")
        .populate("battles.ai2")
        .populate("battles.ai2.user");
    ctx.assert(user_round, "参数错误");

    ctx.body = {
        success: true,
        data: {
            _id: user_round._id,
            user: _.pick(user_round.user, ["_id", "username", "nickname"]),
            battles: user_round.battles.map(pick_battle),
            finished_battle_cnt: user_round.finished_battle_cnt,
            finished: user_round.finished,
            created_date: user_round.created_date
        }
    };
});
