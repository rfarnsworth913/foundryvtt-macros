/* ==========================================================================
    Macro:         Song of Rest
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Song of Rest",
    state: args[0]?.tag || args[0] || "unknown",

    targets: lastArg.hitTargets
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("sequencer")?.active)) {
    return false;
}

props.targets.forEach((target) => {
    setTimeout(() => {
        new Sequence()
            .effect()
                .file("jb2a.healing_generic.400px.blue")
                .attachTo(target)
                .scaleToObject(2)
            .play()
    }, 500);
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
