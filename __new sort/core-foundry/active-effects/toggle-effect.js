/**
 * Toggles the state of a specified effect on a target actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function toggleEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return false;
    }

    return await effect.update({ disabled: !effect.data.disabled });
}
