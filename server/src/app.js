// 网站

let mount = require("koa-mount");
let Koa = require("koa");
let Router = require("koa-router");
let bodyParser = require("koa-bodyparser");
let session = require("koa-session");
let RateLimiterMemory = require("rate-limiter-flexible").RateLimiterMemory;
let auth = require("./services/auth");
let _ = require("lodash");

let config = require("./config");
let { SERVER } = require("./config");

let app = new Koa();

app.use(bodyParser({
    formLimit: "10MB"
}));
app.keys = [config.SERVER.SECRET_KEYS];
const CONFIG = {
    key: "ai:sess", /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
};
app.use(session(CONFIG, app));

app.use(async (ctx, next) => {
    ctx.state.ip = ctx.headers["x-real-ip"] || ctx.ip;
    await next();
});

let api = new Router();

api.use(require("koa-logger")());
// rate limit
const rateLimiter = new RateLimiterMemory({
    points: 100,
    duration: 10, // Per second
    blockDuration: 600 // 超出限制之后禁用时间（秒）
});
api.use(async (ctx, next) => {
    let ip = ctx.state.ip;
    try {
        await rateLimiter.consume(ip);
        await next();
    } catch (e) {
        console.log(`rate limit for ${ip}`);
        ctx.status = 403;
        ctx.body = `Server received too much request from your ip ${ip}.`;
    }
});
api.use(async (ctx, next) => {
    let origin = null;
    if (ctx.headers.origin) {
        const allowed_hosts = ["0.0.0.0", "127.0.0.1", "localhost", "192.168."];
        for (let item of allowed_hosts) {
            if (ctx.headers.origin.indexOf(item) !== -1) {
                origin = ctx.headers.origin;
            }
        }
    }
    if (origin) {
        ctx.set({
            "Access-Control-Allow-Origin": origin
        });
    }
    ctx.set({
        "Access-Control-Allow-Credentials": true
    });
    await next();
});
// error handle
api.use(async (ctx, next) => {
    try {
        ctx.set({
            "Cache-Control": "nocache"
        });
        await next();
    } catch (e) {
        console.error(e);
        ctx.body = {
            success: false,
            message: e.message
        };
    }
});

api.use(auth.mid);

api.use("", require("./controllers/index").routes());
api.use("", require("./controllers/user").routes());
api.use("", require("./controllers/main").routes());

api.options("(.*)", async ctx => {
    let headers = ["content-type"];
    if (_.has(ctx.headers, "access-control-request-headers")) {
        headers = _.concat(headers, ctx.headers["access-control-request-headers"].split(","));
    }
    headers = _.uniq(headers);
    ctx.set({
        "Access-Control-Allow-Headers": headers.join(","),
        "Access-Control-Allow-Methods": "*"
    });
    ctx.body = {
        success: true
    };
});
api.all("(.*)", async ctx => {
    ctx.status = 404;
    ctx.body = {
        success: false,
        message: "Not Found"
    };
});

app.use(mount("/api", api.routes()));
app.use(async ctx => {
    ctx.status = 404;
    ctx.body = "404 Not Found";
});

app.listen(SERVER.PORT, SERVER.ADDRESS);

console.log(`listen on http://${SERVER.ADDRESS}:${SERVER.PORT}`);
