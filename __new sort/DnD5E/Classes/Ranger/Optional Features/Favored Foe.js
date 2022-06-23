/* ==========================================================================
    Macro:              Favored Foe
    Description:        Handles application of Damage
    Source:             https://www.patreon.com/posts/favored-foe-54927796
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return false;
    }

    // Handle OnUse -----------------------------------------------------------
    if (props.state === "OnUse") {
        if (props.hitTargets.length === 0) {
            return {};
        }

        // Get target information
        const target    = props.hitTargets[0].id;
        const { actor } = props;

        // Error if not target
        if (!actor || !target) {
            console.error("Favored For: no token/targer selected");
            return {};
        }

        // Apply active effect to target
        const effectData = {
            changes: [
                {
                    key:      "flags.midi-qol.favoredFoe",
                    mode:     5,
                    value:    target,
                    priority: 20
                },
                {
                    key:      "flags.dnd5e.DamageBonusMacro",
                    mode:     0,
                    value:    `ItemMacro.${props.itemData.name}`,
                    priority: 20
                }
            ],
            origin:   props.uuid,
            disabled: false,
            duration: props.itemData.effects[0].duration,
            icon:     props.itemData.img,
            label:    props.itemData.name
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }

    // Damage Bonus Macro -----------------------------------------------------
    if (props.state === "DamageBonus") {
        let crit = 1;
        if (props.isCrticial) {
            crit = 2;
        }

        const targetID = props.hitTargets[0].id;

        // Check if favored foe is already applied
        if (getProperty(props.actor.data.flags, "midi-qol.AlreadyUsed")) {
            return {};
        }

        // Only apply to weapon attacks
        if (!["mwak", "rwak"].includes(props.itemData.data.actionType)) {
            return {};
        }

        // Only on the marked target
        if (targetID !== getProperty(props.actor.data.flags, "midi-qol.favoredFoe")) {
            return {};
        }

        const damageType = props.itemData.data.damage.parts[0][1];
        const duration   = {
            rounds: null,
            seconds: 1,
            startRound: null,
            startTime: null,
            startTurn: null,
            turns: null,
        };

        const effectData = {
            changes: [{
                key:      "flags.midi-qol.AlreadyUsed",
                mode:     5,
                value:    "1",
                priority: 20
            }],
            origin: props.uuid,
            disabled: false,
            duration,
            label: "Favored Foe already used this round"
        };
        await props.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        // Apply bonus damage
        const damageRoll = await new Roll(`${crit}d${props.actor.data.data.scale.ranger["favored-foe"]}[${damageType}]`).roll({ async: false });

        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            damageRoll.total,
            damageType,
            props.hitTargets,
            damageRoll,
            { flavor: `Favored Foe - Damage Roll (${damageType})` }
        );
    }

})();


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  "Favored Foe",
        state: args[0].tag || args[0] || "",

        actor:      tokenData.actor || {},
        hitTargets: lastArg.hitTargets,
        itemData:   lastArg.item,
        isCritical: lastArg.isCritical || false,
        tokenID:    lastArg.tokenId,
        uuid:       lastArg.uuid
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
            if (key === "isCritical" && props.isCritical === false) {
                return;
            }

            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
