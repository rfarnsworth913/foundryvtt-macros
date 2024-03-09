/* ==========================================================================
    Macro:         Shield of Faith
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Shield of Faith",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    targetData: await fromUuid(lastArg.tokenUuid) || {},
    animation: {
        intro: "jb2a.shield.01.intro.yellow",
        loop:  "jb2a.shield.01.loop.yellow",
        outro: "jb2a.shield.01.outro_explode.yellow"
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

// Apply Shield Animation to effected target(s) -------------------------------
if (props.state === "on") {
    new Sequence()
        .effect()
            .file(props.animation.intro)
            .attachTo(props.targetData)
            .scaleToObject(1.5)
            .waitUntilFinished(-500)
        .effect()
            .file(props.animation.loop)
            .attachTo(props.targetData)
            .scaleToObject(1.5)
            .persist()
            .name(`Shield-of-Faith-${props.tokenData.uuid}`)
            .fadeIn(300)
            .fadeOut(300)
            .extraEndDuration(800)
        .play();
}

// Remove Shield Animation from effected target(s) ----------------------------
if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name:   `Shield-of-Faith-${props.tokenData.uuid}`,
        object: props.targetData
    });

    new Sequence()
        .effect()
            .file(props.animation.outro)
            .attachTo(props.targetData)
            .scaleToObject(1.5)
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
