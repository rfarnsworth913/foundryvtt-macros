/* ==========================================================================
    Macro:         Sacred Flame
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Sacred Flame",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animations: {
        source: "jb2a.sacred_flame.source.yellow",
        target: "jb2a.sacred_flame.target.yellow"
    },
    target: lastArg.hitTargets[0] || {},

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if ((game.modules.get("sequencer")?.active)) {
    new Sequence()
        .effect()
            .file(props.animations.source)
            .scaleToObject(1.75)
            .atLocation(props.tokenData)
            .waitUntilFinished(-500)
        .effect()
            .file(props.animations.target)
            .scaleToObject(1.75)
            .atLocation(props.target)
            .fadeIn(200)
            .fadeOut(200)
        .play();
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
