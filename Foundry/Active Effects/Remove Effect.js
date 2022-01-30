/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actor, effectLabel = ""}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    let effect = actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
}
