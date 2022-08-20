/**
 * Handles applying updates to a specified token
 *
 * @param    {object}     [options]
 * @param    {Token5e}    tokenData  Token to be operated on
 * @param    {Object}     updates    A collection of updates to be performed on the token
 * @param    {Boolean}    animate    Should updates be animated
 * @returns  {Promise}
 */
async function updateToken ({ tokenData, updates, animate = false }) {
    if (!tokenData) {
        return console.error("No token data specified!");
    }

    if (!updates) {
        return console.error("No updates specified!");
    }

    return await tokenData.document.update(updates, { animate });
}
