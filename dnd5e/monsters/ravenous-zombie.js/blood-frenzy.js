/* ==========================================================================
    Macro:         Blood Frenzy
    Source:        Custom
    Usage:         Actor Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blood Frenzy",
    state: args[0]?.tag || args[0] || "unknown",
    pass:  args[0]?.macroPass || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" && props.pass === "preAttackRoll") {
    const workflow    = MidiQOL.Workflow.getWorkflow(args[0].uuid);
    const { targets } = workflow;
    let { advantage } = workflow;

    // Check Workflows --------------------------------------------------------
    targets.forEach((target) => {
        const actor = target.actor.getRollData();

        if (actor.attributes.hp.value < actor.attributes.hp.max) {
            advantage = true;
        }
    });

    workflow.advantage = advantage;
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
