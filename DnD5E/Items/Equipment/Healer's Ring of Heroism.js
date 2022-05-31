/* ==========================================================================
    Macro:              Ring of Healer's Heroism
    Description:        Handles applying conditional effects of the Ring
    Source:             Custom
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Only handle if we're on a damage bonus
    if (props.state === "DamageBonus" && props.targets.length > 0) {
        const damageType = props.lastArg.damageDetail[0]?.type || "unknown";

        // Exit if we are not doing healing or only targeting self
        if (damageType !== "healing" || isTargetingSelf(props.source, props.targets)) {
            return;
        }

        // Create effect information
        const gameRound = game.combat ? game.combat.round : 0;
        const modifier  = props.source.data.attributes.spellcasting || "";
        const tempHP    = props.source.data.abilities?.[modifier]?.mod;

        const effectData = {
            changes: [
                {
                    key:      "data.attributes.hp.temp",
                    mode:     2,
                    value:    tempHP,
                    priority: 20
                },
                {
                    key:      "data.traits.ci.value",
                    mode:     2,
                    value:    "frightened",
                    priority: 20
                }
            ],
            origin: props.lastArg.itemUuid,
            disabled: false,
            duration: {
                rounds:     1,
                turns:      1,
                seconds:    12,
                startRound: gameRound,
                startTime:  game.time.worldTime
            },
            icon:  "worlds/assets/icons/items/equipment/rings/ring-of-healers-heroism.png",
            label: props.name
        };

        // Apply effects to self
        const actorData = canvas.tokens.get(props.lastArg.tokenId).actor;
        await actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }

})();

function isTargetingSelf (actorData, targetData) {

    // If targeting more than one target, allow
    if (targetData.length > 1) {
        return false;
    } else {
        return actorData?.name === targetData?.[0]?.actor?.data?.name;
    }
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg = args[args.length - 1];

    return {
        name:    "Ring of Healer's Heroism",
        state:   lastArg.tag || "",
        source:  lastArg.actor || {},
        targets: lastArg.targets || [],
        lastArg
    };
}

/**
* Logs the extracted property values to the console for debugging purposes
*/
function logProps (props, title) {
    console.group(`${title} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
* Takes the properties object and validates that all specified values have been defined before trying to execute
* the macro
*
* @param  props  Properties to be evaluated
*/
function validateProps (props) {
    const missingProps = [];

    Object.keys(props).forEach((key) => {
        if (!props[key] || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
