const fetch = require('node-fetch');
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
        return new Guild(await fetch.default(
            `https://discord.com/api/v6/guilds/${id}`,
            {
                headers: {
                    Authorization: `Bot ${client.settings.token}`,
                }
            }
        ), client.settings.token);
    }

    this.has = has;
    this.set = set;
    this.get = get;
    this.fetch = _fetch;
    this.delete = _delete;
}

module.exports.GuildsManager = GuildsManager;
