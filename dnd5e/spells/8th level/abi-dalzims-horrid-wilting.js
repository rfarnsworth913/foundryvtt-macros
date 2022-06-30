/* ==========================================================================
    Macro:         Abi-Dalzim’s Horrid Wilting
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Abi-Dalzim’s Horrid Wilting",
    state: args[0]?.macroPass || args[0] || "unknown",

    templateID: args[0]?.templateId || ""
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "templatePlaced") {
    const creatureTypes = ["construct", "undead"];
    const newTargets    = args[0].targets.reduce((targets, target) => {
        const invalid = creatureTypes.some((creatureType) => {
            return (target.actor.data.data.details.race ||
                    target.actor.data.data.details.type.value).toLowerCase().includes(creatureType);
        });

        if (!invalid) {
            targets.push(target);
        }

        return targets;
    }, []).map((token) => {
        return token.id;
    });

    game.user.updateTokenTargets(newTargets);
    game.user.broadcastActivity({ targets: newTargets });
}

if (props.state === "postActiveEffects") {
    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [props.templateID]);
    game.user.updateTokenTargets([]);
    game.user.broadcastActivity({ targets: [] });
}

console.warn(args);


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
