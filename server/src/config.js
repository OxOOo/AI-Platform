let _ = require("lodash");
let yaml = require("js-yaml");
let path = require("path");
let fs = require("fs");

let config = yaml.load(fs.readFileSync(path.join(__dirname, "..", "config.yml"), "utf-8"));

exports.SERVER = _.pick(config["SERVER"], ["ADDRESS", "PORT", "SECRET_KEYS", "MAXAGE"]);

// 数据库相关
if ("MONGO_HOST" in process.env) { // for docker
    exports.MONGODB_URL = `mongodb://${process.env["MONGO_HOST"]}/${config["MONGODB"]["DATABASE"]}`;
} else {
    exports.MONGODB_URL = `mongodb://${config["MONGODB"]["HOSTNAME"]}/${config["MONGODB"]["DATABASE"]}`;
}
