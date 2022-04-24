let Router = require("koa-router");
let _ = require("lodash");
let auth = require("../services/auth");

const router = module.exports = new Router();

router.get("/user/my_info", async ctx => {
    if (ctx.state.user) {
        ctx.body = {
            success: true,
            data: _.pick(ctx.state.user, ["_id", "username", "nickname"])
        };
    } else {
        ctx.body = {
            success: true,
            user: null
        };
    }
});

// username,password
router.post("/user/login", async ctx => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;
    ctx.assert(username, "请输入username");
    ctx.assert(password, "请输入password");
    ctx.body = {
        success: true,
        user_auth: await auth.login(ctx, username, password)
    };
});

// new_password
router.post("/user/modify_password", auth.LoginRequired, async ctx => {
    let new_password = ctx.request.body.new_password;
    ctx.assert(new_password, "请输入password");
    ctx.assert(new_password.length <= 64, "密码太长");

    let user = ctx.state.user;
    user.password = new_password;
    await user.save();
    ctx.body = {
        success: true,
        user_auth: await auth.login(ctx, user.username, user.password)
    };
});
