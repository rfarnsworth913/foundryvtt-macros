/* ==========================================================================
    Macro:         Frenzy
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Frenzy",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "off") {
    props.actorData.update({
        "system.attributes.exhaustion": Math.clamp(props.sactorData.system.attributes.exhaustion + 1, 0, 6)
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
