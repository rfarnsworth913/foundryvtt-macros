/* ==========================================================================
    Macro:         Alchemical Savant
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Alchemical Savant",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData || {},
    tokenData,

    damageTypes: ["healing", "acid", "fire", "necrotic", "poison"],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {
    // Check damage type ------------------------------------------------------
    const applyDamage = props.lastArg.damageDetail.reduce((list, damageDetails) => {
        if (props.damageTypes.includes(damageDetails.type)) {
            list.push(damageDetails);
        }

        return list;
    }, []);

    // Apply damage if damage type is valid -----------------------------------
    if (applyDamage.length > 0) {
        const intModifier = props.actorData.system.abilities.int.mod;
        const damageBonus = intModifier >= 1 ? intModifier : 1;

        return {
            damageRoll: damageBonus,
            flavor:     props.name
        };
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
