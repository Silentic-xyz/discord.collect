const fetch = require('node-fetch').default;

/**
    @typedef {{
        id: string,
        type: integer,
    }} ChannelRawData
    @typedef {{
        id: string,
        type: integer,
        guild_id: string,
        name: string,
        position: number,
        permission_overwrites: PermissionsOverridesRawData[],
        rate_limit_per_user: number,
        nsfw: boolean,
        topic: string,
        last_message_id: string,
        parent_id: string?,
    }} TextChannelRawData
    @typedef {{
        id: string,
        type: integer,
    }} DMChannelRawData
    @typedef {
        'text' |
        'dm' |
        'voice' |
        'group' |
        'category' |
        'news' |
        'store'
    } ChannelType
    @typedef {{
        id: string,
        type: string,
        allow_new: string,
        deny_new: string,
    }} PermissionsOverridesRawData
 */

/**
 * Channel
 * @param {ChannelRawData} raw Channel data
 * @param {string} token Token
 */
function Channel(raw, token) {
    this.id = id;
    this.rawType = raw.type;
    this.type = [
        'text',
        'dm',
        'voice',
        'group',
        'category',
        'news',
        'store',
    ][raw.type];

    /**
     * Get original channel object
     * @param {ChannelType | number | undefined} type Channel type
     * @returns {TextChannel | null}
     */
    function getOriginal(type) {
        if (type instanceof String) type = [
            'text',
            'dm',
            'voice',
            'group',
            'category',
            'news',
            'store',
        ].indexOf(type);

        if (raw.type != type && typeof type != 'undefined') return null;
        switch (raw.type) {
            case 0:
                return new TextChannel(raw, token);
        
            default:
                return null;
        }
    }
    this.getOriginal = getOriginal();
}
module.exports.Channel = Channel;

/**
 * Text channel
 * @param {TextChannelRawData} raw Text channel data
 * @param {string} token Token
 */
function TextChannel(raw, token) {
    this.id = id;
    this.rawType = raw.type;
    this.type = [
        'text',
        'dm',
        'voice',
        'group',
        'category',
        'news',
        'store',
    ][raw.type];

    /**
     * Get original channel object
     * @param {ChannelType | number | undefined} type Channel type
     * @returns {TextChannel} Original channel
     */
    function getOriginal(type) {
        return this;
    }
    this.getOriginal = getOriginal();

    this.name = raw.name;
    this.nsfw = raw.nsfw;;
    this.topic = raw.topic;
    this.position = raw.position;
    this.slow = raw.rate_limit_per_user > 0;
    this.slowmode = raw.rate_limit_per_user;
    this.parent = raw.parent_id;
    this.lastmessage = raw.last_message_id;

    async function fetchParent() {
        if (!raw.parent_id) return null;
    }
    this.fetchParent = fetchParent;

    this.overrides = raw.permission_overwrites.map(a => new Object({
        id: a.id,
        type: a.type,
        allow: a.allow_new,
        forbid: a.deny_new,
    }));
}
module.exports.TextChannel = TextChannel;
