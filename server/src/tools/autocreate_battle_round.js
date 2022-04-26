let moment = require("moment");
let sleep = require("../services/sleep");
let round = require("../services/round");

async function main() {
    let time = moment();
    time = time.second(0).minute(0);
    if (time.isBefore(moment())) {
        time = time.add(1, "hour");
    }

    while (true) {
        console.log(`Next time ${time.format("YYYY-MM-DD HH:mm")}`);
        while (moment().isBefore(time)) {
            await sleep(1000);
        }

        await round.CreateBattleRound();
        time = time.add(1, "hour");
    }
}

(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();
