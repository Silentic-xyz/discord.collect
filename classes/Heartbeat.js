const Client = require('./Client');

/**
 * [CLASS] Heartbeat
 * @param {Client} client Client
 */
module.exports = function Heartbeat(client) {
    let timeout = undefined;
    let sequence = null;

    /**
     * Start heartbeat
     * @param {number} ms Heartbeat in ms
     */
    function setHeartbeat(ms) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            client.ws.json({
                op: 1,
                d: sequence,
            });
            setHeartbeat(ms);
        }, ms);
    }

    /**
     * Set sequence for heartbeat
     * @param {number} seq Sequence
     */
    function setSequence(seq) {
        sequence = seq;
    }

    /**
     * Get sequence for heartbeat
     */
    function getSequence() {
        return sequence;
    }

    this.setHeartbeat = setHeartbeat;
    this.setSequence = setSequence;
    this.getSequence = getSequence;
}
