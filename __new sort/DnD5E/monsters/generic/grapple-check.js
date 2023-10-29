/* ==========================================================================
    Macro:         Grapple Check
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Grapple Check",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    flavor: "Escape Grapple",
    saveDC: 15,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "each") {
    await game.MonksTokenBar.requestRoll([props.tokenData], {
        dc:       props.saveDC,
        flavor:   props.flavor,
        showdc:   false,
        contine:  "passed",
        rollMode: "request",
        callback: ({ tokenresults }) => {
            tokenresults.forEach(async (token) => {
                const { uuid }  = token.actor;
                const hasEffect = game.dfreds.effectInterface.hasEffectApplied("Grappled", uuid);

                if (hasEffect) {
                    game.dfreds.effectInterface.removeEffect({ effectName: "Grappled", uuid });
                }
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
