/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
 async function getEffect ({ actorData, effectLabel = `` } = {}) {
    if (!actorData) {
        return console.error(`No actor specified!`);
    }

    return actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    });
}
