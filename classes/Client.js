const lib = require('../lib');
const Heartbeat = require('./Heartbeat');
const {Collection} = require('@discordjs/collection');

/**
 * @typedef { 'discord.collect' | 'Discord Android' | 'Discord IOS' | 'Discord Desktop' } ClientBrowser
 * @typedef { { gateway: string?, debugger: (message: string) => void, token: string?, browser: ClientBrowser?, device: ClientBrowser?, platform: Platform? } } ClientSettings
 * @typedef { 'login' | 'message' | 'ready' | 'close' | 'log' | 'raw' } ClientEvent
 * @typedef { 'darwin' | 'openbsd' | 'linux' | 'windows' } Platform
 */

/**
 * [CLASS] Discord client
 * @param {ClientSettings?} settings Client settings
 */
function Client(settings) {
    const ws = new lib.WebSocket((settings || {}).gateway || 'wss://gateway.discord.gg/?v=6&encoding=json');
    const heartbeat = new Heartbeat(this);
    const events = new (require('events').EventEmitter)();

    ws.json = (d) => ws.send(JSON.stringify(d));

    ws.on('open', () => {
        if ((settings || {}).debugger) settings.debugger("Gateway opened");
    });

    ws.on('close', () => {
        if ((settings || {}).debugger) settings.debugger("Gateway closed");
        events.emit('close');
    });

    ws.on('message', msg => {
        const data = JSON.parse(`${msg}`);

        if ((settings || {}).debugger) settings.debugger(`Recieved: ${JSON.stringify(data, null, 4)}`);

        if (data.s) heartbeat.setSequence(data.s);

        events.emit('raw', ws, data);
    });

    function login(token) {
        if (token) settings.token = token;
        return new Promise((res, rej) => {
            function wse() {
                unlink();

                rej(new Error("Gateway has been disconnected"));
            }
            function thise(...args) {
                unlink();

                res(...args);
            }
            function unlink() {
                ws.off('close', wse);
                ws.off('error', wse);
                events.off('login', thise);
            }

            ws.on('close', wse);
            ws.on('error', wse);
            events.on('login', thise);
        });
    }

    function disconnect() {
        ws.close();
    }

    /**
     * Listen once for an event
     * @param {ClientEvent} event 
     * @param {(...any) => {}} cb 
     */
    function once(event, cb) {
        events.once(event, cb);
    }

    /**
     * Listen for an event
     * @param {ClientEvent} event 
     * @param {(...any) => {}} cb 
     */
    function on(event, cb) {
        events.on(event, cb);
    }

    /**
     * Stop listening for an event
     * @param {ClientEvent} event 
     * @param {(...any) => {}} cb 
     */
    function off(event, cb) {
        events.off(event, cb);
    }

    this.destroy = disconnect;
    this.disconnect = disconnect;
    this.login = login;
    this.ws = ws;
    this.on = on;
    this.once = once;
    this.off = off;
    this.guilds = new Collection();

    //Some descryptors

    events.on('raw',
        /**
         * [EVENT] On identify
         * @param {lib.WebSocket} ws WebSocket
         * @param {{ op: number, s: ?number, d: any, t: string }} data Data
         */
        function onRaw(ws, data) {
            if (data.op != 10) return;

            ws.json({
                "op": 2,
                "d": {
                    "token": settings.token,
                    "properties": {
                        "$os": settings.platform || process.platform,
                        "$browser": settings.browser || settings.device || 'discord.collect',
                        "$device": settings.device || settings.browser || 'discord.collect',
                    }
                }
            });
        }
    );

    events.on('raw',
        /**
         * [EVENT] On identify
         * @param {WebSocket} ws WebSocket
         * @param {{ op: number, s: ?number, d: any, t: string }} data Data
         */
        function onRaw(ws, data) {
            if (data.op != 0 && data.t != 'READY') return;

            events.emit('login');
        }
    );
}
module.exports = Client;
