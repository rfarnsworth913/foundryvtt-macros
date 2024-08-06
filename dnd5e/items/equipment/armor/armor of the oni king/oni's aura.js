/* ==========================================================================
    Macro:         Oni's Aura
    Source:        Custom
    Usage:         DAE Item Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Oni's Aura",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    saveDiff: 5,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Get data for processing ----------------------------------------------------
const workflow = props.lastArg.workflow;
const saveDC   = workflow.saveDC;
const saveDiff = saveDC - props.saveDiff;
const saveData = workflow.saveDisplayData;

if (props.lastArg.failedSaves.length === 0 && props.lastArg.fumbledSaves.length === 0) {
    return console.info("No failed or fumbled saves to process.");
}

// Handle applying additional conditions --------------------------------------
saveData.forEach((tokenSaveData) => {
    if (tokenSaveData.rollTotal <= saveDiff) {

    }
});

// Get effect to be modified
// Apply palaraized effect
// Midi-QOL Overtime Handler
// Animations



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
