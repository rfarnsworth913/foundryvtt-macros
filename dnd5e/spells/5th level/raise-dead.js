/* ==========================================================================
    Macro:         Raise Dead
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Raise Dead",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animations: {
        intro: "jb2a.magic_signs.circle.02.necromancy.intro.green",
        loop:  "jb2a.magic_signs.circle.02.necromancy.loop.green",
        outro: "jb2a.magic_signs.circle.02.necromancy.outro.green"
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
            .file(props.animations.intro)
            .scaleToObject(1.75)
            .atLocation(props.target)
            .belowTokens()
            .waitUntilFinished(-500)
        .effect()
            .file(props.animations.loop)
            .scaleToObject(1.75)
            .atLocation(props.target)
            .belowTokens()
            .fadeIn(200)
            .fadeOut(200)
            .waitUntilFinished(-500)
        .effect()
            .file(props.animations.outro)
            .scaleToObject(1.75)
            .atLocation(props.target)
            .belowTokens()
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
