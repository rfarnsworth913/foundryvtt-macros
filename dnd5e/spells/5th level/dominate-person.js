/* ==========================================================================
    Macro:         Dominate Person
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Dominate Person",
    state: args[0]?.tag || args[0] || "unknown",

    actorData:   tokenData?.actor || {},
    failedSaves: lastArg.failedSaves || [],
    spellLevel:  lastArg.castData.castLevel || 5,
    targetActor: lastArg.targets[0]?.actor || "",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check if changes are necessary ---------------------------------------------
if (props.targetActor === "" || props.spellLevel === 5 || props.failedSaves.length === 0) {
    return false;
}

// Update concentration -------------------------------------------------------
const duration = getDuration(props.spellLevel);
const concentration = await getEffect({ actorData: props.actorData, effectLabel: "Concentrating" });

console.warn(concentration);

if (concentration) {
    await wait(500);
    await updateEffects({
        actorData: props.actorData,
        updates: [{
            _id: concentration.id,
            duration: {
                seconds: duration
            }
        }]
    });
}

// Update Target Effect -------------------------------------------------------
const effect = await getEffect({ actorData: props.targetActor, effectLabel: "Charmed" });

console.warn(effect);

if (effect) {
    await wait(500);
    await MidiQOL.socket().executeAsGM("updateEffects", {
        actorUuid: props.targetActor.uuid,
        updates: [{
            _id: effect.id,
            duration: {
                seconds: duration
            }
        }]
    });
}


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

function getDuration (spellLevel) {
    return spellLevel === 6 ? 600 :
           spellLevel === 7 ? 3600 : 28800;
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
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}

/**
 * Updates an existing effect on a target actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  updates      Updates to be applied to the target
 * @returns  {Promise<Function>}           Update handler
 */
async function updateEffects ({ actorData, updates = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!updates || updates.length === 0) {
        return console.error("No updates specified");
    }

    return await MidiQOL.socket().executeAsGM("updateEffects", {
        actorUuid: actorData.uuid,
        updates
    });
}


/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}
