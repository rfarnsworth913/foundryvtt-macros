/* ==========================================================================
    Macro:         Remove Caster Concentration
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Remove Caster Concentration",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: DAE.DAEfromUuid(lastArg.efData.origin.substring(0, lastArg.efData.origin.indexOf("Item") - 1))
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "off") {
    await removeEffect({
        actorData:   props.actorData,
        effectLabel: "Concentrating"
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return {};
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
