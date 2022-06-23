/* ==========================================================================
    Macro:              Searing Smite
    Description:        Handles Searing Smite damage application
    Source:             https://www.patreon.com/posts/searing-smite-56611523
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Apply to self ----------------------------------------------------------
    if (props.state === "OnUse") {
        const itemData   = props.lastArg.item;
        const spellLevel = props.lastArg.spellLevel;
        const effectData = [{
            changes: [
                {
                    key:      "flags.dnd5e.DamageBonusMacro",
                    mode:     0,
                    value:    `ItemMacro.${itemData.name}`,
                    prioirty: 20
                },
                {
                    key:      "flags.midi-qol.spellLevel",
                    mode:     0,
                    value:    spellLevel,
                    prioirty: 20
                },
                {
                    key:      "flags.midi-qol.spellId",
                    mode:     0,
                    value:    props.lastArg.uuid,
                    prioirty: 20
                }
            ],
            origin: props.lastArg.uuid,
            disabled: false,
            duration: {
                rounds:     10,
                seconds:    60,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            flags: {
                dae: {
                    itemData,
                    specialDuration: ["1Hit"]
                }
            },
            icon:  itemData.img,
            label: game.i18n.localize(itemData.name)
        }];

        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: props.tokenData.uuid,
            effects:   effectData
        });
    }


    // Damage Bonus -----------------------------------------------------------
    if (props.state === "DamageBonus") {
        if (!["mwak"].includes(props.lastArg.item.data.actionType)) {
            return {};
        }

        const target = canvas.tokens.get(lastArg.hitTargets[0].id);
    }

})();


/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}


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
        name:  `Searing Smite`,
        state: lastArg.tag || ``,

        actorData: tokenData.actor || {},
        tokenData,

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
