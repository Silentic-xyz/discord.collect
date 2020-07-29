const fetch = require('node-fetch').default;
const Client = require('./Client');
const Guild = require('./Guild');

/**
 * Guild manager
 * @param {Client} client discord.collect client
 */
function GuildsManager(client) {
    /**
     * @type {Map<string, Guild>}
     */
    const data = new Map();

    function _delete(id) {
        return data.delete(id);
    }

    function has(id) {
        return data.has(id);
    }

    function set(id, guild) {
        data.set(id, guild);
    }

    function get(id) {
        return data.get(id);
    }

    async function _fetch(id) {
        const resp = await fetch(
            `https://discord.com/api/v6/guilds/${id}`,
            {
                headers: {
                    Authorization: `Bot ${token}`,
                }
            }
        );
        if (resp.status != 200) throw new Error(`Cannot fetch guild`);
        return new Guild(await resp.json(), token);
    }
    this.fetch = _fetch;

    this.has = has;
    this.set = set;
    this.get = get;
    this.fetch = _fetch;
    this.delete = _delete;
}

module.exports.GuildsManager = GuildsManager;
