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

    color: "red",
    templateID: args[0]?.templateId || ""
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "preActiveEffects") {

    // Animate applying effect ------------------------------------------------
    if (game.modules.get("sequencer")?.active) {
        const template = canvas.templates.placeables.find((template) => {
            return template.id === props.templateID;
        });

        console.warn(template);

        if (!template) {
            return false;
        }

        new Sequence()
            .effect()
                .file(`jb2a.fireflies.few.01.${props.color}`)
                .atLocation(template)
                .scaleToObject()
                .fadeOut(500)
            .effect()
                .file(`jb2a.fireflies.few.02.${props.color}`)
                .atLocation(template)
                .scaleToObject()
                .fadeOut(500)
            .effect()
                .file(`jb2a.fireflies.many.01.${props.color}`)
                .atLocation(template)
                .scaleToObject()
                .fadeOut(500)
            .effect()
                .file(`jb2a.fireflies.many.02.${props.color}`)
                .atLocation(template)
                .scaleToObject()
                .fadeOut(500)
            .waitUntilFinished()
            .thenDo(async () => {
                await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [props.templateID]);
                game.user.updateTokenTargets([]);
                game.user.broadcastActivity({ targets: [] });
            })
            .play();

    // Handle normal removal of measured template -----------------------------
    } else {
        await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [props.templateID]);
        game.user.updateTokenTargets([]);
        game.user.broadcastActivity({ targets: [] });
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
