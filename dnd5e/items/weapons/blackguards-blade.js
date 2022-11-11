/* ==========================================================================
    Macro:         Blackguard's Blade
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blackguard's Blade",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,
    tokenData,

    target: lastArg.hitTargets[0] || "",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Validate Damage Requirements -------------------------------------------
    if (props.itemData.name !== "Divine Smite" || props.target === "") {
        return false;
    }

    if (!props.target.actor.getRollData().details.alignment.toLowerCase().includes("good")) {
        return false;
    }

    // Get combat history -----------------------------------------------------
    let workflowIndex = 0;
    Object.values(MidiQOL.Workflow.workflows).forEach((workflow, index) => {
        if (workflow.actor.id === props.actorData.id &&
            workflow.workflowType === "Workflow" &&
            workflow.item?.name === "Divine Smite") {
            workflowIndex = index;
        }
    });

    const messageHistory = Object.values(MidiQOL.Workflow.workflows)[workflowIndex - 1];

    if (messageHistory.item?.name !== props.name) {
        return false;
    }

    return {
        damageRoll: `10[${CONFIG.DND5E.damageTypes.necrotic}]`,
        flavor:     props.name
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
