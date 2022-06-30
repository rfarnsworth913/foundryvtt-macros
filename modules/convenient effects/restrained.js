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

    animation: "jb2a.markers.chain.standard.loop.02.blue",
    label:     `Restrained-${lastArg.tokenId}`,
    tokenData,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("sequencer")?.active)) {
    return false;
}

if (props.state === "on") {
    new Sequence()
        .effect()
            .file(props.animation)
            .attachTo(props.tokenData)
            .persist()
            .scale(0.5)
            .name(props.label)
            .fadeIn(300)
            .fadeOut(300)
        .play();
}

if (props.state === "off") {
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
