/* ==========================================================================
    Macro:         Acid Splash
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Acid Splash",
    state: args[0]?.tag || args[0] || "unknown",

    tokenData,

    missed:  lastArg.targets,
    targets: lastArg.failedSaves
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}

// Get targets ----------------------------------------------------------------
let missed = false;

if (props.targets.length === 0) {
    props.targets.push(props.missied[0]);
    missed = true;
}

// Handle animation -----------------------------------------------------------
new Sequence()
    .effect()
        .file("jb2a.fire_bolt.green")
        .atLocation(props.tokenData)
        .stretchTo(props.targets[0])
        .missed(missed)
    .effect()
        .file("jb2a.liquid.splash.green")
        .atLocation(props.targets[1] ?? false)
        .scale(0.5)
        .delay(500)
        .playIf(props.targets.length === 2)
    .play();


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
