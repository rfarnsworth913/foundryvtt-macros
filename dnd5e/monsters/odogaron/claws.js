/* ==========================================================================
    Macro:         Staunch Wound
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Staunch Wound",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    flavor: "Staunch Wound",
    saveDC: 12,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "each") {
    await game.MonksTokenBar.requestRoll([props.tokenData], {
        request:  "skill:med",
        dc:       props.saveDC,
        flavor:   props.flavor,
        showdc:   false,
        contine:  "passed",
        rollMode: "request",
        callback: async () => {
            await removeEffect({
                actorData:   props.actorData,
                effectLabel: "Bloody Wound"
            });
        }
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
        return effect.data.label.toLowerCase().startsWith(effectLabel.toLowerCase());
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
