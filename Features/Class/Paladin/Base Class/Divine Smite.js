/* ==========================================================================
    Macro:              Divine Smite
    Description:        Handles damage for Divine Smite
    Source:             https://www.patreon.com/posts/divine-smite-47781600
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check for Improved Damage ----------------------------------------------
    const improved = props.actor.items.find(i => i.name === "Improved Divine Smite");
    if (improved) {
        props.dice = props.dice *= 2;
    }


    // Check history for attack information -----------------------------------
    let messageHistory = Object.values(MidiQOL.Workflow.workflows).filter((item) => {
        return item.actor.id === props.actor.id &&
               item.workflowType === "Workflow" &&
               item.item?.name !== props.item.name;
    });

    if (messageHistory.length === 0) {
        return ui.notifications.error(`You need to successfully attack first!`);
    }


    // Calculate and apply damage ---------------------------------------------
    let lastAttack    = messageHistory[messageHistory.length - 1];
    let target        = canvas.tokens.get(lastAttack.damageList[0].tokenId);
    let creatureTypes = ["undead", "fiend"];
    let undead        = creatureTypes.some(i => (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(i));
    let damageType    = "radiant";

    if (undead) {
        props.dice = props.dice *= 2;
    }

    let damageRoll = lastAttack.isCritical ? new Roll(`${props.dice * 2}d8[${damageType}]`).evaluate({ async: false }) :
                                             new Roll(`${props.dice}d8[${damageType}]`).evaluate({ async: false });

    await game.dice3d?.showForRoll(damageRoll);
    let damageWorkflow = await new MidiQOL.DamageOnlyWorkflow(
        props.actor,
        props.token,
        damageRoll.total,
        damageType,
        [target],
        damageRoll,
        {
            flavor:     `(${CONFIG.DND5E.damageTypes[damageType]})`,
            itemCardId: props.itemCardId,
            itemData:   props.item,
            useOther:   false
        }
    );

    let damageBonusMacro = getProperty(props.actor.data.flags, `${game.system.id}.DamageBonusMacro`);
    if (damageBonusMacro) {
        await damageWorkflow.rollBonusDamage(damageBonusMacro);
    } else {
        await damageWorkflow;
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
    const lastArg = args[args.length - 1];

    return {
        name:       "Divine Smite",
        actor:      game.actors.get(lastArg.actor._id),
        dice:       Math.min(5, Number(lastArg.spellLevel) + 1),
        item:       lastArg.item,
        itemCardId: lastArg.itemCardId,
        token:      canvas.tokens.get(lastArg.tokenId)
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
    let missingProps = [];

    Object.keys(props).forEach((key) => {
        if (props[key] === undefined || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
