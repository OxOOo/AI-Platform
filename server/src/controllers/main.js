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

router.post("/ai/create_user_round", auth.LoginRequired, async ctx => {
    await round.CreateUserRound(ctx.state.user);
    ctx.body = {
        success: true
    };
});
