const fetch = require('node-fetch').default;
const Flags = require('./UserFlags');

/**
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
 * User
 * @param {RawUserData} raw User
 * @param {string} token Token
 */
function User(raw, token) {
    this.id = raw.id;
    this.name = `${raw.username}#${raw.discriminator}`;
    this.username = raw.username;
    this.discriminator = raw.discriminator;
    
    /**
     * Fetch animated icon
     * @returns {Promise<string>} Icon URL (gif if possible)
     */
    function fetchAnimatedIcon() {
        return new Promise((res, rej) => {
            fetch(`https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.gif/`)
            .then(resp => {
                if (resp.status != 200) return res(`https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.jpg/`);
                res(`https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.gif/`);
            })
            .catch(rej);
        });
    }
    this.fetchAnimatedIcon = fetchAnimatedIcon;

    this.email = raw.email;
    this.emailVerified = raw.verified;

    this.mfa = raw.mfa_enabled;

    this.flags = new Flags(raw.flags || []);
    this.publicFlags = new Flags(raw.public_flags || []);

    this.nitro = [
        "None",
        "Nitro Classic",
        "Nitro",
        "Unknown",
    ][raw.premium_type === undefined ? raw.premium_type : 3];
    this.premium_type = raw.premium_type;
}
module.exports.User = User;
