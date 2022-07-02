/* ==========================================================================
    Macro:         Faerie Fire
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Faerie Fire",
    state: args[0]?.macroPass || args[0] || "unknown",

    templateID: args[0]?.templateId || ""
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "postActiveEffects") {
    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [props.templateID]);
    game.user.updateTokenTargets([]);
    game.user.broadcastActivity({ targets: [] });
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
