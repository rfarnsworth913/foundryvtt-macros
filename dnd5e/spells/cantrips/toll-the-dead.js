/* ==========================================================================
    Macro:         Toll the Dead
    Source:        MidiQOL Example Spells
    Usage:         On Item Use
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Toll the Dead",
    macroPass: "preDamageRoll",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    itemData: await fromUuidSync(lastArg.uuid),
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" || props.macroPass === "preDamageRoll") {
    const target = await fromUuidSync(props.lastArg.targetUuids[0]);
    const needsD12 = target.actor.system.attributes.hp.value < target.actor.system.attributes.hp.max;
    let [formula] = props.itemData.system.damage.parts[0];
    let scalingFormula = props.itemData.system.scaling.formula;

    if (needsD12) {
        formula = formula.replace("d8", "d12");
        if (scalingFormula) {
            scalingFormula = scalingFormula.replace("d8", "d12");
        }
    } else {
        formula = formula.replace("d12", "d8");
        if (scalingFormula) {
            scalingFormula = scalingFormula.replace("d12", "d8");
        }
    }

    props.itemData.system.scaling.formula = scalingFormula;
    props.itemData.system.damage.parts[0][0] = formula;
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
