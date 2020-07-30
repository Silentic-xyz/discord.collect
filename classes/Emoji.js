const fetch = require('node-fetch').default;
const {User} = require('./User');

/**
    @typedef {
        {
            id: string,
            name: string,
            roles: RawRoleData[],
            user: RawUserData,
            require_colons: boolean,
            managed: boolean,
            animated: boolean,
            available: boolean?,
        }
    } RawEmojiData
    @typedef {{
        id: string,
        name: string,
        color: number,
        hoist: boolean,
        position: number,
        permissions: number,
        managed: boolean,
        mentionable: boolean,
    }} RawRoleData
    @typedef {{
        id: string,
        username: string,
        discriminator: string,
        avatar: string,
        bot: boolean,
        system: boolean,
        mfa_enabled: boolean,
        locale: string,
        verified: boolean?,
        email: string?,
        flags: number,
        premium_type: number,
        public_flags: number,
    }} RawUserData
 */

/**
 * Emoji
 * @param {RawEmojiData} raw Raw emoji data
 * @param {string} token Token
 */
function Emoji(raw, token) {
    this.id = raw.id;
    this.name = raw.name;
    this.managed = raw.managed;
    this.creator = new User(raw.user, token);
    this.roles = raw.roles.map(r => new Role(r));
    this.animated = raw.animated;
    this.available = raw.available;
    this.requireColons = raw.require_colons;
}
module.exports = Emoji;
