// 主要功能区
let Router = require("koa-router");
let _ = require("lodash");
let auth = require("../services/auth");
let round = require("../services/round");
let { AI } = require("../models");

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

router.post("/ai/create_user_round", auth.LoginRequired, async ctx => {
    await round.CreateUserRound(ctx.state.user);
    ctx.body = {
        success: true
    };
});
