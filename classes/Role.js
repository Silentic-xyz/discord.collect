const fetch = require('node-fetch').default;
const Permissions = require('./Permissions');

/**
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
 * Role
 * @param {RawRoleData} raw Raw role data
 * @param {string} token Token
 */
function Role(raw, token) {
    this.id = raw.id;
    this.name = raw.id;
    this.color = raw.color;
    this.hoist = raw.hoist;
    this.position = raw.position;
    this.permissions = new Permissions(raw.permissions);
    this.managed = raw.managed,
    this.mentionable = raw.mentionable;
}
module.exports = Role;
