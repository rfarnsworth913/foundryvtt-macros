/* ==========================================================================
    Macro:         Token Update
    Source:        https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/Callback%20Macros/TokenUpdate.js
    Usage:         const TokenUpdate = game.macros.getName("TokenUpdate");
                   TokenUpdate.execute(target.id, { XYZ }, "on | off" (optional));
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Token Update",
    state: args[0]?.tag || args[0] || "unknown",

    tokenID: args[0],
    data:    args[1],
    animate: args[2] ?? false
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
await canvas.tokens.get(props.tokenID).document.update(props.data, {
    animate: props.animate
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
