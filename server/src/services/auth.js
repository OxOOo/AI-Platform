let { User } = require("../models");
let config = require("../config");
let moment = require("moment");
let utility = require("utility");

// header: UserAuth
function GenUserAuth(user) {
    let data = {
        user_id: user._id,
        password_sha1: utility.hmac("sha1", config.SERVER.SECRET_KEYS, user.password, "base64"),
        expire: moment().add(moment.duration(1, "day")).unix() * 1000
    };
    let data_s = JSON.stringify(data);
    let sign = utility.hmac("sha1", config.SERVER.SECRET_KEYS, data_s, "base64");
    let auth_data = {
        data_s, sign
    };
    return utility.base64encode(JSON.stringify(auth_data));
}
async function GetAuthedUser(ctx) {
    try {
        let UserAuth = ctx.req.headers.userauth;
        if (!UserAuth) return null;
        let { data_s, sign } = JSON.parse(utility.base64decode(UserAuth));
        if (utility.hmac("sha1", config.SERVER.SECRET_KEYS, data_s, "base64") !== sign) return null;
        let data = JSON.parse(data_s);
        if (moment(data.expire).isBefore(moment())) return null;
        let user = await User.findById(data.user_id);
        if (!user) return null;
        if (utility.hmac("sha1", config.SERVER.SECRET_KEYS, user.password, "base64") !== data.password_sha1) return null;
        return user;
    } catch (e) {
        return null;
    }
}

exports.mid = async (ctx, next) => {
    ctx.state.user = await GetAuthedUser(ctx);
    await next();
};

exports.login = async (ctx, username, password) => {
    let user = await User.findOne({ username });
    ctx.assert(user, "用户不存在");
    ctx.assert(user.password == password, "密码错误");
    return GenUserAuth(user);
};

exports.LoginRequired = async (ctx, next) => {
    ctx.assert(ctx.state.user, "需要登录");
    await next();
};
