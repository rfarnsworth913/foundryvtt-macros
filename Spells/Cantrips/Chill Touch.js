/* ==========================================================================
    Macro:              Chill Touch
    Description:        Handles applying custom effects of Chill Touch
    Source:             https://www.patreon.com/posts/chill-touch-53100896
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check dependencies -----------------------------------------------------
    if (props.hitTargets.length === 0) {
        return {};
    }


    // Get target information -------------------------------------------------
    const target        = canvas.tokens.get(props.hitTargets[0].id);
    const creatureTypes = ["undead"];
    const undead        = creatureTypes.some((type) => {
        return (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(type);
    });


    // Generate effect --------------------------------------------------------
    const spellSeconds = props.item.data.duration.value * 6;
    const gameRound    = game.combat ? game.combat.round : 0;
    const effectName   = `${props.item.name} Effect`;

    let undeadDis = [{
        key:      "data.traits.di.value",
        mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value:    "healing",
        priority: 20
    }];

    if (undead) {
        undeadDis.push({
            key:      "flags.midi-qol.disadvantage.attack.all",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    1,
            priority: 20
        });
    }

    let effectData = {
        label: effectName,
        icon:  props.item?.img,
        origin: props.uuid,
        disabled: false,
        flags: {
            dae: {
                itemData: props.item
            }
        },
        duration: {
            rounds:     props.item.data.duration.value,
            seconds:    spellSeconds,
            startRound: gameRound,
            startTime:  game.time.worldTime
        },
        changes: undeadDis
    };

    if (await hasEffect({ actor: target.actor, effectLabel: effectName })) {
        return {};
    }

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: target.actor.uuid,
        effects: [effectData]
    });

})();


/**
 * Checks if a specified actor has the expected effect applied to their character
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<Boolean>}       Status of the effect on target
 */
async function hasEffect({ actor, effectLabel = `` } = {}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    return Boolean(actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
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
        name:       "Chill Touch",
        hitTargets: lastArg.hitTargets,
        item:       lastArg.item,
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
