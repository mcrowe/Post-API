"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
function start(port, controller) {
    const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        const t = Date.now();
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        if (req.method == 'OPTIONS') {
            res.end('');
            return;
        }
        if (req.method != 'POST') {
            sendJSON(res, { error: 'Invalid request method' });
            log(`Invalid request method: ${req.method}`);
            return;
        }
        if (!req.url || !req.url.endsWith('/action')) {
            sendJSON(res, { error: 'Invalid request url' });
            log(`Invalid request url: ${req.url}`);
            return;
        }
        let body;
        try {
            body = yield parseBody(req);
            log(`[${body.action}] Started`);
            const [result, message] = yield handle(body, controller);
            sendJSON(res, result);
            log(`[${body.action}] Completed in ${Date.now() - t}ms => ${message}`);
        }
        catch (err) {
            sendJSON(res, { error: 'Invalid request' });
            log('Invalid request body');
        }
    }));
    server.listen(port, (err) => {
        if (err) {
            return log('something bad happened: ' + err.message);
        }
        log(`Ready and listening on port ${port}`);
    });
}
exports.default = start;
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = [];
        req.on('error', (err) => {
            reject('Error parsing body as JSON: ' + err.message);
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            try {
                body = Buffer.concat(body).toString();
                const json = JSON.parse(body);
                resolve(json);
            }
            catch (err) {
                reject('Error parsing body as JSON: ' + err.message);
            }
        });
    });
}
function sendJSON(res, json) {
    res.end(JSON.stringify(json));
}
function handle(body, controller) {
    return __awaiter(this, void 0, void 0, function* () {
        const action = controller[body.action];
        if (action) {
            try {
                const data = yield action(body.params);
                return [
                    { data },
                    'OK'
                ];
            }
            catch (err) {
                return [
                    { error: 'action_handler_error' },
                    `Handler Error: ${err.message}`
                ];
            }
        }
        return [
            { error: 'action_not_found' },
            'Not Found'
        ];
    });
}
function log(msg) {
    console.log(msg);
}
