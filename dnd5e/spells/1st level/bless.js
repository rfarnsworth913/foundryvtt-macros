/* ==========================================================================
    Macro:         Bless
    Source:        JB2A Animations
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Bless",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}

if (props.state === "on") {
    new Sequence()
        .effect()
            .file("jb2a.bless.200px.intro.blue")
            .atLocation(props.tokenData)
            .waitUntilFinished(-500)
        .effect()
            .file("jb2a.bless.200px.loop.blue")
            .attachTo(props.tokenData)
            .belowTokens()
            .persist()
            .name(`Bless-${props.tokenData.id}`)
        .play();
}

if (props.state === "off") {
    Sequencer.EffectManager.endEffects({
        name:   `$Bless-${props.tokenData.id}`,
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
