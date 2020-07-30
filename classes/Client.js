const lib = require('../lib');
const Heartbeat = require('./Heartbeat');
const {GuildsManager} = require('./DataManager');
const {Guild, UncachedGuild} = require('./Guild');
const {EventEmitter} = require('events');
const Message = require('./Message');
const {Channel} = require('./Channel');

/**
   @typedef { 'discord.collect' | 'Discord Android' | 'Discord IOS' | 'Discord Desktop' } ClientBrowser
   @typedef {{
        gateway: string?,
        debugger: (message: string) => void,
        token: string?,
        browser: ClientBrowser?,
        device: ClientBrowser?,
        platform: Platform?,
        cache: boolean?,
    }} ClientSettings
   @typedef { 'darwin' | 'openbsd' | 'linux' | 'windows' } Platform
   @typedef { { op: number, d: any, t: RawDataIntent?, s: number? } } RawData
   @typedef {
        'READY' |
        'GUILD_CREATE' |
        'GUILD_UPDATE' |
        'GUILD_DELETE' |
        'GUILD_ROLE_CREATE' |
        'GUILD_ROLE_UPDATE' |
        'GUILD_ROLE_DELETE' |
        'CHANNEL_CREATE' |
        'CHANNEL_UPDATE' |
        'CHANNEL_DELETE' |
        'CHANNEL_PINS_UPDATE' |
        'GUILD_MEMBER_ADD' |
        'GUILD_MEMBER_UPDATE' |
        'GUILD_MEMBER_REMOVE' |
        'GUILD_BAN_ADD' |
        'GUILD_BAN_REMOVE' |
        'GUILD_EMOJIS_UPDATE' |
        'GUILD_INTEGRATIONS_UPDATE' |
        'WEBHOOKS_UPDATE' |
        'INVITE_CREATE' |
        'INVITE_DELETE' |
        'VOICE_STATE_UPDATE' |
        'PRESENCE_UPDATE' |
        'MESSAGE_CREATE' |
        'MESSAGE_UPDATE' |
        'MESSAGE_DELETE' |
        'MESSAGE_DELETE_BULK' |
        'MESSAGE_REACTION_ADD' |
        'MESSAGE_REACTION_REMOVE' |
        'MESSAGE_REACTION_REMOVE_ALL' |
        'MESSAGE_REACTION_REMOVE_EMOJI' |
        'CHANNEL_CREATE' |
        'MESSAGE_CREATE' |
        'MESSAGE_UPDATE' |
        'MESSAGE_DELETE' |
        'CHANNEL_PINS_UPDATE' |
        'MESSAGE_REACTION_ADD' |
        'MESSAGE_REACTION_REMOVE' |
        'MESSAGE_REACTION_REMOVE_ALL' |
        'MESSAGE_REACTION_REMOVE_EMOJI' |
        'TYPING_START'
    } RawDataIntent
 * @typedef {
        ((arg0: "login", arg1: Function) => {}) &
        ((arg0: "ready", arg1: Function) => {}) &
        ((arg0: "close", arg1: Function) => {}) &
        ((arg0: "raw", arg1: ((arg0: lib.WebSocket, arg1: RawData) => {})) => {}) &
        ((arg0: "guildRecieved", arg1: ((arg0: UncachedGuild) => {})) => {}) &
        ((arg0: "guildReady", arg1: ((arg0: Guild) => {})) => {}) &
        ((arg0: "message", arg1: ((arg0: Message) => {})) => {})
    } ClientEvents
 */

/**
 * [CLASS] Discord client
 * @param {ClientSettings?} settings Client settings
 */
function Client(settings) {
    const ws = new lib.WebSocket((settings || {}).gateway || 'wss://gateway.discord.gg/?v=6&encoding=json');
    const heartbeat = new Heartbeat(this);
    /**
     * @fires Client#login
     * @fires Client#ready
     * @fires Client#raw
     * @fires Client#close
     * @fires Client#guild
     */
    const events = new EventEmitter();
    const guilds = new GuildsManager();

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
     * Listen for an event
     * @type {ClientEvents}
     */
    const on = (...args) => {
        events.on(...args);
    }
    this.on = on;

    /**
     * Listen for an event
     * @type {ClientEvents}
     */
    const off = (...args) => {
        events.on(...args);
    }
    this.off = off;

    /**
     * Listen for an event
     * @type {ClientEvents}
     */
    const once = (...args) => {
        events.on(...args);
    }
    this.once = once;

    this.destroy = disconnect;
    this.disconnect = disconnect;
    this.login = login;
    this.guilds = guilds;
    this.settings = settings;
    this.ws = ws;

    //Some descryptors

    on('raw',
        (ws, data) => {
            if (data.op != 10) return;

            heartbeat.setHeartbeat(data.d.heartbeat_interval);

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

    on('raw',
        function onRaw(ws, data) {
            if (data.op != 0 && data.t != 'READY') return;

            events.emit('login');
        }
    );

    on('raw',
        function onRaw(ws, data) {
            if (data.op != 0 || data.t != 'READY') return;

            events.emit('login');
        }
    );

    on('raw',
        function onRaw(ws, data) {
            if (data.op != 0 || data.t != 'GUILD_CREATE') return;

            if (data.d.guilds) {
                for (let guild of data.d.guilds) {
                    if (!guild.unanivable) {
                        const g = new Guild(guild);
                        if (settings.cache) guilds.set(g.id, g);
                        events.emit('guildReady', g);
                    }
                    else {
                        const g = new UncachedGuild(guild);
                        if (settings.cache) guilds.set(g.id, g);
                        events.emit('guildRecieved', g);
                    }
                }
            }
            else {
                if (!data.d.unanivable) {
                    const g = new Guild(data.d);
                    if (settings.cache) guilds.set(g.id, g);
                    events.emit('guildReady', g);
                }
                else {
                    const g = new UncachedGuild(data.d);
                    guilds.set(g.id, g);
                    events.emit('guildRecieved', g);
                }
            }
        }
    );

    on('raw',
        function onRaw(ws, data) {
            if (data.op != 0 || data.t != 'GUILD_DELETE') return;

            if (!data.d.unanivable) {
                const g = new Guild(data.d);
                if (settings.cache) guilds.set(data.id, g);
                events.emit('guildReady', g);
            }
            else {
                const g = new UncachedGuild(data.d);
                if (settings.cache) guilds.set(data.id, g);
                events.emit('guildRecieved', g);
            }
        }
    );

    on('raw',
        function onRaw(ws, data) {
            if (data.op != 0 || data.t != 'GUILD_UPDATE') return;

            if (!data.d.unanivable) {
                const g = new Guild(data.d);
                if (settings.cache) guilds.set(data.id, g);
                events.emit('guildReady', g);
            }
            else {
                const g = new UncachedGuild(data.d);
                if (settings.cache) guilds.set(data.id, g);
                events.emit('guildRecieved', g);
            }
        }
    );

    on('raw', (ws, data) => {
        if (data.op != 0 || data.t != 'MESSAGE_CREATE') return;

        const message = new Message(data.d, settings.token);
        events.emit('message', message);
    })
}
Client.__proto__ = EventEmitter;
module.exports = Client;

/**
 * Ready event
 *
 * @event Client#ready
 */

/**
 * Close event
 *
 * @event Client#close
 */

/**
 * Raw data event
 *
 * @event Client#raw
 * @property {lib.WebSocket} ws WebSocket
 * @property {RawData} data Raw data
 */

/**
 * Guild update event
 * 
 * @event Client#guild
 * @property {Guild} guild Updated guild
 */
