const fetch = require('node-fetch');
const channels = require('./Channel');
const {User} = require('./User');

/**
    @typedef {{
        id: string,
        channel_id: string,
        guild_id: string?,
        author: RawUserData,
        member: RawMemberData?,
        content: string,
        timestamp: string,
        edited_timestamp: string,
        tts: boolean,
        mention_everyone: boolean,
        mentions: RawUserData[],
        mention_roles: RawRoleData[]?,
        mention_channels: RawChannelMentionData[]?,
        attachments: RawAttachmentData[],
        embeds: RawEmbedData[]?,
        reactions: RawReactionData[]?
        nonce: number | string,
        pinned: boolean,
        webhook_id: string?,
        type: number,
        activity: RawActivityData?,
        application: RawApplicationData?,
        message_reference: RawMessageReferenceData?,
        flags: number,
    }} RawMessageData
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
        guild_id: string,
        type: integer,
        name: string,
    }} RawChannelMentionData
 */

/**
 * Message
 * @param {RawMessageData} raw Message from discord API
 * @param {string} token Token
 */
function Message(raw, token) {
    this.content = raw.content;
    this.id = raw.id;
    this.channel = raw.channel_id;
    this.guild = raw.guild_id;
    this.nonce = raw.nonce;
    this.system = raw.type != 0;
    this.type = raw.type;
    this.webhook = raw.webhook_id;
    this.at = new Date(raw.timestamp);
    this.edited = raw.timestamp == raw.edited_timestamp;
    this.editedat = new Date(raw.edited_timestamp);
    this.author = new User(raw.author);
}
module.exports = Message;
