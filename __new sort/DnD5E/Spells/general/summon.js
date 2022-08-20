/* ==========================================================================
    Macro:         Summon
    Source:        Generial Summoning Macro
    Usage:         DAE ItemMacro {{ Actor Name }} @item
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Summon",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},

    summonID:    `${args[2]?.name.replace(" ", "_")}_Summoned_Token`,
    summonToken: args[1] || ""
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}


// Handle Summoning -----------------------------------------------------------
if (props.state === "on") {
    const updates = {};

    const target = await warpgate.spawn(props.summonToken, updates);
    await props.actorData.setFlag("midi-qol", props.summonID, target[0]);
}


// Handle Unsummoning ---------------------------------------------------------
if (props.state === "off") {
    const target = await props.actorData.getFlag("midi-qol", props.summonID);

    if (target) {
        await warpgate.dismiss(target, game.scenes.current.data.document.id);
        await props.actorData.unsetFlag("midi-qol", props.summonID);
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
