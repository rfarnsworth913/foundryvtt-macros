/* ==========================================================================
    Macro:         Chromacloth
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Chromacloth",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},

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

// Disable effects ------------------------------------------------------------
props.effects.forEach(async (effectLabel) => {

    const effect = props.actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (effect) {
        await effect.update({ disabled: true });
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
