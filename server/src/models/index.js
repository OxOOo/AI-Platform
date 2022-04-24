let mongoose = require("mongoose");
let config = require("../config");
let autoIncrement = require("mongoose-auto-increment");

mongoose.Promise = global.Promise;

let connection = mongoose.createConnection(config.MONGODB_URL);

autoIncrement.initialize(connection);

connection.asPromise().catch(err => {
    console.error("connect to %s error: ", config.MONGODB_URL, err.message);
    process.exit(1);
});

exports.User = require("./user")(connection);
exports.AI = require("./ai")(connection);
exports.Battle = require("./battle")(connection);
exports.UserRound = require("./user_round")(connection);
