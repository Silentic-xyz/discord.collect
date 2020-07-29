const fetch = require('node-fetch').default;
const Role = require('./Role');

/**
 * @typedef { {
        id: string,
        name: string,
        icon: string?,
        splash: string?,
        discovery_splash: string?,
        owner: boolean?,
        owner_id: string?,
        permissions: number?,
        region: string,
        afk_channel_id: string?,
        afk_timeout: number,
        embed_enabled: boolean?,
        embed_channel_id: boolean?,
        verification_level: number,
        default_message_notifications: number,
        explicit_content_filter: number,
        roles: RawRoleData[],
        emojis: [],
        features: [],
        mfa_level: number,
        application_id: string?,
        widget_enabled: boolean?,
        widget_channel_id: string?,
        system_channel_id: string?,
        system_channel_flags: number,
        rules_channel_id: string?,
        joined_at: string?,
        large: boolean?,
        unavailable: boolean?,
        member_count: number?,
        voice_states: []?,
        members: []?,
        channels: []?,
        presences: []?,
        max_presences: number?,
        max_members: number?,
        vanity_url_code: string?,
        description: string?,
        banner: string?,
        premium_tier: number,
        premium_subscription_count: number?,
        preferred_locale: string,
        public_updates_channel_id: string?,
        max_video_channel_users: number?,
        approximate_member_count: number?,
        approximate_presence_count: number?,
    } } GuildRawData
 * @typedef {{
        id: string,
        name: string,
        color: number,
        hoist: boolean,
        position: number,
        permissions: number,
        managed: boolean,
        mentionable: boolean,
    }} RawRoleData
 */

/**
 * Guild class
 * @param {GuildRawData} raw Guild raw data
 * @param {string} token Bot's token
 */
function Guild(raw, token) {
    this.id = BigInt(raw.id);
    this.name = raw.name;
    this.description = raw.description;
    this.rawRegion = raw.region;
    this.ownerid = raw.owner_id;

    this.unavailable = raw.unavailable;
    this.anivable = !raw.unavailable;

    this.defaultIcon = raw.icon ? `https://cdn.discordapp.com/icons/${raw.id}/${raw.icon}.jpg/` : null;

    /**
     * Fetch animated icon
     * @returns {Promise<string>} Icon URL (gif if possible)
     */
    function fetchAnimatedIcon() {
        return new Promise((res, rej) => {
            fetch(`https://cdn.discordapp.com/icons/${raw.id}/${raw.icon}.gif/`)
            .then(resp => {
                if (resp.status != 200) return res(`https://cdn.discordapp.com/icons/${raw.id}/${raw.icon}.jpg/`);
                res(`https://cdn.discordapp.com/icons/${raw.id}/${raw.icon}.gif/`);
            })
            .catch(rej);
        });
    }
    this.fetchAnimatedIcon = fetchAnimatedIcon;

    async function _fetch(id) {
        return new Guild(await fetch.default(
            `https://discord.com/api/v6/guilds/${id}`,
            {
                headers: {
                    Authorization: `Bot ${token}`,
                }
            }
        ), token);
    }
    this.fetch = fetch;

    this.roles = raw.roles ? raw.roles.map(r => new Role(r)) : undefined;
}
module.exports = Guild;
