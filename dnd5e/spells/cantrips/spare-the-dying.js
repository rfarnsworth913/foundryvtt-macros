/* ==========================================================================
    Macro:         Spare the Dying
    Source:        Custom
    Usage:         UseItem
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = await fromUuidSync(lastArg.targetUuids[0]);

const props = {
    name: "Spare the Dying",
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

    // Check if conditions are valid to update actor data ---------------------
    if (props.actorData.system.attributes.hp.value <= 0 &&
        props.actorData.system.attributes.death.failure < 3) {
        console.warn("Updating actor data to prevent death...");
        props.actorData.update({
            "system.attributes.death.success": 3,
            "system.attributes.death.failure": 0
        });
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
