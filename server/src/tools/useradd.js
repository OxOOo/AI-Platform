let { User } = require("../models");
let Confirm = require("prompt-confirm");

async function main() {
    if (process.argv.length < 4) {
        console.log("Usage: node useradd.js username password [nickname]");
        return;
    }
    let username = process.argv[2];
    let password = process.argv[3];
    let nickname = process.argv.length >= 5 ? process.argv[4] : username;

    console.log(`username: ${username}`);
    console.log(`password: ${password}`);
    console.log(`nickname: ${nickname}`);
    let prompt = new Confirm("Confirm?");
    if (!await prompt.run()) {
        return;
    }

    await User.create({
        username, password, nickname
    });
    console.log("Create user success");
}

(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
