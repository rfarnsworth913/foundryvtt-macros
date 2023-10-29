/* ==========================================================================
    Macro:         Fireball
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Fireball",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animation: {
        beam: "jb2a.fireball.beam.orange",
        explosion: "jb2a.fireball.explosion.orange",
        groundEffect: "jb2a.ground_cracks.orange.01"
    },
    templateID: lastArg.templateId,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}

if (props.state === "OnUse") {
    new Sequence()
        .effect()
            .file(props.animation.beam)
            .atLocation(props.tokenData)
            .stretchTo(props.templateID)
        .effect()
            .file(props.animation.explosion)
            .atLocation(props.templateID)
            .delay(2100)
        .effect()
            .file(props.animation.groundEffect)
            .atLocation(props.templateID)
            .belowTokens()
            .scaleIn(0.5, 150, { ease: "easeOutExpo" })
            .duration(5000)
            .fadeOut(3250, { ease: "easeInSine" })
            .delay(2300)
            .waitUntilFinished(-3250)
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
