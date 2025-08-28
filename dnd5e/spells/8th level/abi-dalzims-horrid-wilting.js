/* ==========================================================================
    Macro:         Abi-Dalzim’s Horrid Wilting
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Abi-Dalzim’s Horrid Wilting",
    state: lastArg?.macroPass || lastArg || "unknown",

    targets: lastArg?.targets || [],

    templateUuid: lastArg?.templateUuid || "",
    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "templatePlaced") {
    const creatureTypes = ["construct", "undead"];
    const newTargets = props.targets.reduce((targets, target) => {
        const invalid = creatureTypes.some((creatureType) => {
            return target.actor.system.details.type.value.toLowerCase().includes(creatureType);
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
    const measuredTemplate = await fromUuidSync(props.templateUuid);
    await game.scenes.current.deleteEmbeddedDocuments("MeasuredTemplate", [measuredTemplate.id]);
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
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
