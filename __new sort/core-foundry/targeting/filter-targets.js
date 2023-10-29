/**
 * Filters a target list by creature type
 *
 * @param    {object}          [options]
 * @param    {Array<Actor5e>}  targets        Targets list to be filtered
 * @param    {Array<string>}   creatureTypes  Creature types to filter by
 * @returns                                   Filtered list of targets
 */
async function filterTargets ({ targets = [], creatureTypes = [] }) {

    // Check inputs -----------------------------------------------------------
    if (targets.length === 0) {
        return targets;
    }

    if (creatureTypes.length === 0) {
        ui.notifications.error("No creature types were specified for filtering!");
        return targets;
    }

    // Create filtered targets list -------------------------------------------
    return targets.reduce((targetsList, target) => {

        // Check valid target
        const validTarget = target.actor.type === "character" ?
            creatureTypes.some((creatureType) => {
                return target.actor.data.data.details.race.toLowerCase().includes(creatureType);
            }) :
            creatureTypes.some((creatureType) => {
                return target.actor.data.data.details.type.value.toLowerCase().includes(creatureType);
            });

        if (validTarget) {
            targetsList.push(target);
        }

        return targetsList;
    }, []);
}
