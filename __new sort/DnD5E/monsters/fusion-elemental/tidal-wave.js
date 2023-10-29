/* ==========================================================================
    Macro:         Tidal Wave
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Tidal Wave",
    state: args[0]?.tag || args[0] || "unknown",
    pass:  args[0]?.macroPass || "",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "OnUse" && props.pass === "templatePlaced") {
    const newTargets = props.lastArg.targets.reduce((targets, target) => {
        if (target.actorId !== props.actorData.id) {
            targets.push(target);
        }

        return targets;
    }, []).map((token) => {
        return token.id;
    });

    game.user.updateTokenTargets(newTargets);
    game.user.broadcastActivity({ targets: newTargets });
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
