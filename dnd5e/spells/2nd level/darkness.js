/* ==========================================================================
    Macro:         Darkness
    Source:        https://github.com/dev7355608/limits
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Darkness",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("limits")?.active)) {
    return ui.notifications.error("Limits module is required!");
}

if (props.state === "on") {
    const templateData = {
        t: CONST.MEASURED_TEMPLATE_TYPES.CIRCLE,
        distance: 15,
        fillColor: "#333333",
        flags: {
            limits: {
                sight: {
                    basicSight: { enabled: true, range: 5 },
                    ghostlyGaze: { enabled: true, range: 5 },
                    lightPerception: { enabled: true, range: 5 }
                },
                light: { enabled: true, range: 0 }
            }
        }
    };

    const template = (
        await new dnd5e.canvas.AbilityTemplate(
            new CONFIG.MeasuredTemplate.documentClass(templateData, {
                parent: canvas.scene
            })
        ).drawPreview()
    ).at(0);

    // Animation --------------------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .persist(true)
                .file("jb2a.darkness.black")
                .opacity(0.5)
                .attachTo(template)
                .scaleToObject((template.distance + 2.5) / template.distance)
                .xray(true)
                .aboveLighting()
            .play();
    }

    // Store template ID in actor flags ---------------------------------------
    DAE.setFlag(props.actorData, "darkness", template._id);
}

// Cleanup template and flags
if (props.state === "off") {
    const template = await canvas.scene.getEmbeddedDocument("MeasuredTemplate", DAE.getFlag(props.actorData, "darkness"));
    DAE.unsetFlag(props.actorData, "darkness");
    template?.delete();
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
