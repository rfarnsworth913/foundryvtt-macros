/* ==========================================================================
    Macro:         Beast Sense
    Source:        Custom
    Usage:         ItemMaccro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Beast Sense",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */



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
