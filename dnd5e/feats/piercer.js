/* ==========================================================================
    Macro:         Piercer
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Piercer",
    state: args[0]?.tag || args[0] || "unknown",

    diceSides:  lastArg.damageRoll.terms[0].faces ?? 0,
    damageType: lastArg.item.data.damage.parts[0][1] ?? "unknown",
    isCritical: lastArg?.isCritical || false
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.isCritical && props.damageType === "piercing") {
    return {
        damageRoll: `1d${props.diceSides}[${props.damageType}]`,
        flavor:     "Piercer"
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
