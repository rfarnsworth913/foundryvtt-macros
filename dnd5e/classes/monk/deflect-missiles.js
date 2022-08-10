/* ==========================================================================
    Macro:         Deflect Missiles
    Source:        MidiQOL
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Deflect Missiles",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    effect: await getEffect({
        actorData: tokenData.actor,
        effectLabel: "Deflect Missiles"
    }),
    sourceItem: await fromUuid(lastArg.sourceItemUuid),

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for Ranged Weapon Attack ---------------------------------------------
if (!props.sourceItem?.data.data.actionType !== "rwak") {
    ui.notifications.warn("Attack is not a ranged attack!");
    console.info(`${props.actorData.name} - Deflect Missiles | Attack is not a ranged weapon attack`);
    return false;
}


// Handle Damage Return -------------------------------------------------------
const change = props.effect.data.changes.find((change) => {
    return change.key === "flags.midi-qol.DR.rwak";
});
const dr = Number.isNumeric(change.value) ? Number(change.value) : 0;
const kiPoints = await getResource({
    actorData: props.actorData,
    resource: "Ki"
});

console.warn(kiPoints);

// if (dr >= props.lastArg.workflowOptions.damageTotal) {

// }



/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}

/**
 * Handles attempting to find a resource, and returning it
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @returns  {Promise<any>}       Actor update handler
 */
async function getResource ({ actorData, resource = "" } = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    const { resources } = actorData.toObject().data;
    const [key]         = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    return resources[key];
}
