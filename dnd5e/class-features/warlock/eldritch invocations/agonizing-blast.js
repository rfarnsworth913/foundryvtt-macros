/* ==========================================================================
    Macro:         Agonizing Blast
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Agonizing Blast",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg?.itemData || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.itemData?.name === "Eldritch Blast") {
    const damageType = "";

    return {
        damageRoll: "",
        flavor: "Agonizing Blast Damage Bonus",
    };
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
