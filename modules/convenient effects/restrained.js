/* ==========================================================================
    Macro:         Restrained
    Source:        Custom
    Usage:         DAE macro.execute Restrained
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Restrained",
    state: args[0]?.tag || args[0] || "unknown",

    animation: {
        intro: "jb2a.markers.chain.standard.complete.02.blue",
        loop:  "jb2a.markers.chain.standard.loop.02.blue"
    },
    label:     `Restrained-${lastArg.tokenId}`,
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
            .file(props.animation.intro)
            .attachTo(props.tokenData)
            .scaleToObject(1.5)
            .endTime(2000)
            .waitUntilFinished(-500)
        .effect()
            .file(props.animation.loop)
            .attachTo(props.tokenData)
            .persist()
            .scaleToObject(1.5)
            .name(props.label)
            .fadeOut(600)
        .play();
}


// Remove animation -----------------------------------------------------------
if (props.state === "off") {
    new Sequence()
        .effect()
            .file(props.animation.intro)
            .attachTo(props.tokenData)
            .scaleToObject(1.5)
            .startTime(6000)
        .play();

    Sequencer.EffectManager.endEffects({
        name:   props.label,
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
