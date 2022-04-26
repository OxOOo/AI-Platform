let round = require("../services/round");

async function main() {
    await round.CreateBattleRound();
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
