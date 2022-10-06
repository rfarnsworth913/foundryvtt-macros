/* ==========================================================================
    Macro:         Faerie Fire
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Faerie Fire",
    state: args[0]?.macroPass || args[0] || "unknown",

    color:      "red",
    targets:    lastArg.failedSaveUuids,
    templateID: args[0]?.templateId || "",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Casting animation ----------------------------------------------------------
if (props.state === "preActiveEffects") {

    // Animate applying effect ------------------------------------------------
    if (game.modules.get("sequencer")?.active) {
        const template = canvas.templates.placeables.find((template) => {
            return template.id === props.templateID;
        });

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

// Remove Invisibility --------------------------------------------------------
if (props.state === "postActiveEffects") {
    props.targets.forEach(async (target) => {
        const token = await fromUuid(target);

        await removeEffect({
            actorData:   token.actor,
            effectLabel: "Invisible"
        });
    });
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

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect._id]
    });
}
