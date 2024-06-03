// Example Savage Exploit
// Other
// Get Savage Exploits
// Other
// Generate Dialob Box Sections
// Other
// Render Dialog Box
// Other
// Get Item to Use
// Other
// Use Item
// Other


/* ==========================================================================
    Macro:         Critical Strike
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name:      "Critical Strike",
    state:     args[0]?.tag || args[0] || "unknown",
    macroPass: lastArg.macroPass || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.macroPass === "DamageBonus" &&
    props.lastArg.isCritical) {
    console.warn("Critical Hit!");
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
