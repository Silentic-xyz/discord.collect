
/**
    @typedef {
        'Discord Employee' |
        'Discord Partner' |
        'HypeSquad Events' |
        'Bug Hunter Level 1' |
        'House Bravery' |
        'House Brilliance' |
        'House Balance' |
        'Early Supporter' |
        'Team User' |
        'Unknown' |
        'System' |
        'Unknown' |
        'Bug Hunter Level 2' |
        'Unknown' |
        'Verified Bot' |
        'Verified Bot Developer'
    } FlagsRawString
*/

/**
* Flags
* @param {FlagsRawString[] | FlagsRawString | Flags | number} raw Raw Flags data
*/
function Flags(raw) {
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
    else if (raw instanceof Flags) {
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
     * Check for Flags
     * @param {FlagsRawString[] | FlagsRawString | Flags | number} perms Flags list
     * @returns {boolean} Has permission?
     */
    function has(perms) {
        const permisions = new Flags(perms);
        if (typeof perms == 'number') {
            return permisions.list.includes(getPerm(perms));
        }
        else if (typeof perms == 'string') {
            return permisions.list.includes(perms);
        }
        else if (perms instanceof Flags) {
            return has(perms.bitfield);
        }
        else {
            return perms.map(a => has(a)).map(a => !a).length == 0;
        }
    }
    this.has = has;

    /**
     * Get missing Flags
     * @param {FlagsRawString[] | FlagsRawString | Flags | number} perms Flags list
     * @returns {FlagsRawString[]} List of missing Flags
     */
    function missing(perms) {
        const permisions = new Flags(perms);
        return permisions.list.filter(a => !has(a));
    }
    this.has = has;
}
module.exports = Flags;

/**
* Parse raw string
* @param {FlagsRawString} raw Raw Flags
*/
function parseString(raw) {
    return 2 ** flags.indexOf(raw);
}
Flags.parseString = parseString;

/**
* Get permission name
* @param {number} perm Permission
*/
function getPerm(perm) {
    return flags[Math.log2(perm)];
}
Flags.getFlag = getPerm;

const flags = [
    'Discord Employee',
    'Discord Partner',
    'HypeSquad Events',
    'Bug Hunter Level 1',
    'House Bravery',
    'House Brilliance',
    'House Balance',
    'Early Supporter',
    'Unknown',
    'Team User',
    'System',
    'Unknown',
    'Bug Hunter Level 2',
    'Unknown',
    'Verified Bot',
    'Verified Bot Developer'
];
Flags.flags = flags;
