/* ==========================================================================
    Macro:         Circle of Mortality
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Circle of Mortality",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("midi-qol.preDamageRollComplete", async (workflow) => {

        // Check if damage should be modified----------------------------------
        const [target] = workflow.targets;

        if (workflow.damageDetail[0].type === "healing" &&
            target.actor.system.attributes.hp.value === 0) {
            const formula    = workflow.damageRoll._formula;
            const diceSides  = workflow.damageRoll.terms[0].faces;
            const diceNumber = workflow.damageRoll.terms[0].number;
            const healingAmount = diceSides * diceNumber;

            const roll = new Roll(formula.replace(/[0-9]+d[0-9]+/, healingAmount)).roll({ async: false });
            workflow.setDamageRoll(roll);
        }
    });

    DAE.setFlag(props.actorData, "circleOfMortality", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "circleOfMortality");
    DAE.unsetFlag(props.actorData, "circleOfMortality");

    Hooks.off("midi-qol.preDamageRollComplete", hookID);
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
