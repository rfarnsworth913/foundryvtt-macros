/* ==========================================================================
    Macro:         Relentless Rage
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Relentless Rage",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Check current health ---------------------------------------------------
    const isAtZero = props.actorData.system.attributes.hp.value <= 0;

    if (!isAtZero) {
        ui.notifications.warn("You are not at 0 HP!");
        return false;
    }

    // Get Relentless Rage ----------------------------------------------------
    const item = actor.items.getName("Relentless Rage");

    if (!item) {
        ui.notifications.error("Relentless Rage was not found on actor!");
        return false;
    }

    // Saving Throw -----------------------------------------------------------
    const { value } = item.system.uses;
    const saveDC = 10 + 5 * value;

    const { total } = await actor.rollAbilitySave("con", { event, saveDC });

    if (total < saveDC) {
        return false;
    }

    await actor.update({ "system.attributes.hp.value": 1 });
    await item.update({ "system.uses.value": value + 1 });
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
