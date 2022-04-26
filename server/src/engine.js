let round = require("./services/round");
let sleep = require("./services/sleep");
let moment = require("moment");
let { AI, Battle } = require("./models");
let _ = require("lodash");
let path = require("path");
let fs = require("fs");
let child_process = require("child_process");
let os = require("os");

const MAX_THREADS = 10;
const DATA_PATH = path.resolve(__dirname, "..", "..", "data");
const ENGINE_PATH = path.resolve(__dirname, "..", "..", "engine");

let idle_cpus = _.range(Math.min(MAX_THREADS, os.cpus().length));
console.log(`idle_cpus = ${idle_cpus}`);
let runnings = new Set();

async function run_thread(cpu, battle) {
    let name = `battle-${battle._id}-cpu${cpu}`;
    runnings.add(name);
    try {
        console.log(`Start battle ${battle._id}`);

        const battle_data_path = path.join(DATA_PATH, battle._id.toString());
        fs.mkdirSync(battle_data_path, { recursive: true });

        let ai1 = await AI.findById(battle.ai1);
        let ai2 = await AI.findById(battle.ai2);

        let ai1_code_path = path.join(battle_data_path, "ai1.cpp");
        let ai2_code_path = path.join(battle_data_path, "ai2.cpp");
        fs.writeFileSync(ai1_code_path, ai1.code);
        fs.writeFileSync(ai2_code_path, ai2.code);

        for (let side of [0, 1]) {
            const output_path = path.join(battle_data_path, (side == 0) ? "pos" : "rev");
            const docker_name = `battle-${battle._id}-${(side == 0) ? "pos" : "rev"}`;

            const command = `./run.sh ${ai1_code_path} ${ai2_code_path} ${output_path} ${docker_name}`;
            console.log(`Battle ${battle._id} : ${command}`);

            let p = child_process.exec(command, { cwd: ENGINE_PATH, env: { CPUSET: cpu } });
            let stdouts = [];
            let stderrs = [];
            p.stdout.on("data", (chunk) => {
                stdouts.push(Buffer.from(chunk));
            });
            p.stderr.on("data", (chunk) => {
                stderrs.push(Buffer.from(chunk));
            });
            while (true) {
                if (!_.isNull(p.exitCode)) {
                    break;
                }
                await sleep(100);
            }
            p.kill();
            fs.writeFileSync(path.join(output_path, "stdout.txt"), Buffer.concat(stdouts));
            fs.writeFileSync(path.join(output_path, "stderr.txt"), Buffer.concat(stderrs));

            let ai1_compile_log = "";
            let ai2_compile_log = "";
            let moves = [];
            let error_txt = "";
            let battle_result = "TIE";
            let battle_message = "";
            if (fs.existsSync(path.join(output_path, "ai1.compile_log"))) {
                ai1_compile_log = fs.readFileSync(path.join(output_path, "ai1.compile_log"), "utf-8");
            }
            if (fs.existsSync(path.join(output_path, "ai2.compile_log"))) {
                ai2_compile_log = fs.readFileSync(path.join(output_path, "ai2.compile_log"), "utf-8");
            }
            if (fs.existsSync(path.join(output_path, "moves.json"))) {
                moves = JSON.parse(fs.readFileSync(path.join(output_path, "moves.json"), "utf-8"));
            }
            if (fs.existsSync(path.join(output_path, "error.txt"))) {
                error_txt = fs.readFileSync(path.join(output_path, "error.txt"), "utf-8");
            }
            if (fs.existsSync(path.join(output_path, "result.json"))) {
                let data = JSON.parse(fs.readFileSync(path.join(output_path, "result.json"), "utf-8"));
                battle_result = data["win"];
                battle_message = data["message"];
            }

            let result = { ai1_compile_log, ai2_compile_log, moves, error_txt, battle_result, battle_message };
            if (side == 0) {
                battle.pos = result;
            } else {
                battle.rev = result;
            }

            let tmp = ai1_code_path;
            ai1_code_path = ai2_code_path;
            ai2_code_path = tmp;
        }

        battle.status = "finished";
        await battle.save();

        await round.BattleUpdate(battle);

    } finally {
        idle_cpus.push(cpu);
        runnings.delete(name);
    }
}

async function main() {
    await Battle.updateMany({ status: { $ne: "finished" } }, { $set: { status: "pending" } });

    let last_log_time = moment();
    while (true) {
        if (moment(last_log_time).clone().add(10, "seconds").isBefore(moment())) {
            console.log(`Running ${runnings.size}: ${runnings.size > 0 ? Array.from(runnings).join(",") : "empty"}`);
            last_log_time = moment();
        }

        if (idle_cpus.length > 0) {
            let battle = await Battle.findOneAndUpdate({ status: "pending" }, { status: "running" });
            if (battle) {
                while (true) {
                    if (battle.user_round) break;
                    if (battle.battle_round) break;
                    await sleep(100);
                    battle = await Battle.findById(battle._id);
                }
                run_thread(idle_cpus.shift(), battle);
            }
        }

        await sleep(100);
    }
}

(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
})();
