/* ==========================================================================
    Macro:         Guiding Bolt
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Guiding Bolt",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    target: lastArg.hitTargets[0] || {},

    animation: {
        mark: "jb2a.markers.01.blueyellow"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}


// Apply animation to effected target(s) --------------------------------------
if (props.state === "on") {
    new Sequence()
        .effect()
            .belowTokens()
            .scale(1.5)
            .file(props.animation.mark)
            .attachTo(props.target)
            .persist()
            .name(`GuidingBolt-${props.tokenData.uuid}`)
            .fadeIn(300)
            .fadeOut(300)
        .play();
}

// Remove effect from target(s) -----------------------------------------------
if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name: `GuidingBolt-${props.tokenData.uuid}`,
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
