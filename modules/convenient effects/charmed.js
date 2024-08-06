/* ==========================================================================
    Macro:         Charmed
    Source:        Custom
    Usage:         Convenient Effects (Global Macro)
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Charmed",
    state: args[0]?.tag || args[0] || "unknown",

    animation: "jb2a.markers.heart.pink.02",
    label: `Charmed-${lastArg.tokenId}`,
    tokenData
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("sequencer")?.active)) {
    return false;
}

// Apply animation ------------------------------------------------------------
if (props.state === "on") {
    new Sequence()
        .effect()
        .file(props.animation)
        .attachTo(props.tokenData)
        .scaleToObject(2)
        .persist()
        .name(props.label)
        .fadeIn(300)
        .fadeOut(300)
        .play();
}


// Remove animation -----------------------------------------------------------
if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name: props.label,
        object: props.tokenData
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
