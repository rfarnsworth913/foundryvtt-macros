/* ==========================================================================
    Macro:         Petrified
    Source:        Custom
    Usage:         Applies animations for the Petrified condition
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Petrified",
    state: args[0]?.tag || args[0] || "unknown",

    tokenData,

    animation: "jb2a.ground_cracks.03.orange",
    id:        `Petrified-${lastArg.tokenId}`,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (!(game.modules.get("sequencer")?.active)) {
    return false;
}

// Apply animation ------------------------------------------------------------
if (props.state === "on") {
    new Sequence()
        .effect()
            .file(props.animation)
            .attachTo(props.tokenData)
            .scaleToObject(1.5)
            .opacity(0.75)
            .persist()
            .name(props.id)
            .fadeIn(300)
            .fadeOut(300)
        .play();

    // Apply actor tint -------------------------------------------------------
    const tokenUpdate = game.macros.getName("TokenUpdate");

    if (tokenUpdate) {
        tokenUpdate.execute(props.tokenData.id, {
            tint: "#888C8D"
        });
    }
}


// Remove animation -----------------------------------------------------------
if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name:    props.id,
        objects: props.tokenData
    });

    const tokenUpdate = game.macros.getName("TokenUpdate");

    if (tokenUpdate) {
        tokenUpdate.execute(props.tokenData.id, {
            tint: null
        });
    }
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
