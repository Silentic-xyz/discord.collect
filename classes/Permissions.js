
/**
 * @typedef {
        'CREATE_INSTANT_INVITE' |
        'KICK_MEMBERS' |
        'BAN_MEMBERS' |
        'ADMINISTRATOR' |
        'MANAGE_CHANNELS' |
        'MANAGE_GUILD' |
        'ADD_REACTIONS' |
        'VIEW_AUDIT_LOG' |
        'PRIORITY_SPEAKER' |
        'STREAM' |
        'VIEW_CHANNEL' |
        'SEND_MESSAGES' |
        'SEND_TTS_MESSAGES' |
        'MANAGE_MESSAGES' |
        'EMBED_LINKS' |
        'ATTACH_FILES' |
        'READ_MESSAGE_HISTORY' |
        'MENTION_EVERYONE' |
        'USE_EXTERNAL_EMOJIS' |
        'VIEW_GUILD_INSIGHTS' |
        'CONNECT' |
        'SPEAK' |
        'MUTE_MEMBERS' |
        'DEAFEN_MEMBERS' |
        'MOVE_MEMBERS' |
        'USE_VAD' |
        'CHANGE_NICKNAME' |
        'MANAGE_NICKNAMES' |
        'MANAGE_ROLES' |
        'MANAGE_WEBHOOKS' |
        'MANAGE_EMOJIS'
    } PermissionsRawString
 */

/**
 * Permissions
 * @param {PermissionsRawString[] | PermissionsRawString | Permissions | number} raw Raw permissions data
 */
function Permissions(raw) {
    /**
     * @type {string[]}
     */
    const perms = [];

    if (typeof raw == 'number') {
        this.bitfield = raw;
        perms.push(getPerm(raw));
    }
    else if (typeof raw == 'string') {
        this.bitfield = parseString(raw);
        perms.push(raw);
    }
    else if (raw instanceof Permissions) {
        this.bitfield = raw.bitfield;
        perms = raw.list;
    }
    else {
        let a = 0;

        for (const perm of raw) {
            a += parseString(perm);
            perms.push(perm);
        }

        this.bitfield = a;
    }

    this.list = perms;

    /**
     * Check for permissions
     * @param {PermissionsRawString[] | PermissionsRawString | Permissions | number} perms Permissions list
     * @returns {boolean} Has permission?
     */
    function has(perms) {
        const permisions = new Permissions(perms);
        if (typeof perms == 'number') {
            return permisions.list.includes(getPerm(perms));
        }
        else if (typeof perms == 'string') {
            return permisions.list.includes(perms);
        }
        else if (perms instanceof Permissions) {
            return has(perms.bitfield);
        }
        else {
            return perms.map(a => has(a)).map(a => !a).length == 0;
        }
    }
    this.has = has;

    /**
     * Get missing permissions
     * @param {PermissionsRawString[] | PermissionsRawString | Permissions | number} perms Permissions list
     * @returns {PermissionsRawString[]} List of missing permissions
     */
    function missing(perms) {
        const permisions = new Permissions(perms);
        return permisions.list.filter(a => !has(a));
    }
    this.has = has;
}
module.exports = Permissions;

/**
 * Parse raw string
 * @param {PermissionsRawString} raw Raw permissions
 */
function parseString(raw) {
    return 2 ** flags.indexOf(raw);
}
Permissions.parseString = parseString;

/**
 * Get permission name
 * @param {number} perm Permission
 */
function getPerm(perm) {
    return flags[Math.log2(perm)];
}
Permissions.getPerm = getPerm;

const flags = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
];
Permissions.flags = flags;
