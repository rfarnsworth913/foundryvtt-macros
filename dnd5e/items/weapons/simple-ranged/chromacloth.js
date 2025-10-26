/* ==========================================================================
    Macro:         Chromacloth
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Chromacloth",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg?.actor || {},

    effects: [
        "Chromacloth (Red)",
        "Chromacloth (Yellow)",
        "Chromacloth (Green)",
        "Chromacloth (Blue)"
    ]
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.actorData === "") {
    return false;
}

// Remove effects -------------------------------------------------------------
props.effects.forEach(async (effectLabel) => {

    const effect = props.actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (effect) {
        await removeEffect({ actorData: props.actorData, effectLabel });
    }
});


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

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects: [effect.id]
    });
}
