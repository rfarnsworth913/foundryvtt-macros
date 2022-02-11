/**
 * Checks if a specified actor has the expected effect applied to their character
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<Boolean>}       Status of the effect on target
 */
async function hasEffect({ actor, effectLabel = `` } = {}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    return Boolean(actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
}
