/**
 * Returns the specified effect
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
 async function getEffect({ actor, effectLabel = `` } = {}) {
    if (!actor) {
        return null;
    }

    return (actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
}
