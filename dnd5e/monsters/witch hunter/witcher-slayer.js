/* ==========================================================================
    Macro:         Witch Slayer
    Source:        Custom
    Usage:         DAE DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Witch Slayer",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    attackType: lastArg.itemData.type,
    itemData:   lastArg.itemData,
    targetData: canvas.tokens.get(lastArg.hitTargets[0].id)?.actor.getRollData(),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.targetData && props.attackType === "weapon" &&
    (props.targetData.spells.spell1.max > 0 || props.targetData.spells.pact.max > 0)) {

    const damageType = props.itemData.data.damage.parts[0][1];
    return {
        damageRoll: `2d6[${damageType}]`,
        flavor:     "Witch Slayer"
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
