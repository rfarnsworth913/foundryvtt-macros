/* ==========================================================================
    Macro:              Absorb Elements
    Description:        Handles damage and resistance application(s)
    Source:             https://www.patreon.com/posts/absorb-elements-57262074
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Get message history ----------------------------------------------------
    const messageHistory = game.messages.reduce((list, message) => {
        const damage = message.data.flags?.midiqol?.undoDamage;
        if (damage) {
            list.push(damage);
        }

        return list;
    }, []);


    // Get attack information -------------------------------------------------
    const lastAttack = messageHistory[messageHistory.length - 1];
    const attackData = lastAttack.find((target) => {
        return target.tokenId === props.tokenData.id;
    });
    const damageType = attackData.damageItem.damageDetail[0][0].type;
    const type       = props.elements[damageType];


    // Handle spell effect(s) -------------------------------------------------
    if (type === undefined || null) {
        return ui.notifications.error(`The spell fizzles, ${CONFIG.DND5E.damageTypes[damageType]} is not an element`);
    }

    const gameRound = game.combat ? game.combat.rounds : 0;
    const timeData  = props.itemData.data.duration.value;

    const effectData = [{
        label: props.itemData.name,
        icon:  props.itemData.img,
        changes: [
            {
                key:      "data.bonuses.mwak.damage",
                mode:     2,
                value:    `${props.spellLevel}d6[${damageType}]`,
                priority: 20
            },
            {
                key:      "data.bonuses.msak.damage",
                mode:     2,
                value:    `${props.spellLevel}d6[${damageType}]`,
                priority: 20
            },
            {
                key:      "data.traits.dr.value",
                mode:     2,
                value:    `${damageType}`,
                priority: 20
            }
        ],
        origin: props.lastArg.uuid,
        disabled: false,
        duration: {
            rounds:     timeData,
            seconds:    timeData * 6,
            startTime:  game.time.worldTime,
            startRound: gameRound
        },
        flags: {
            dae: {
                specialDuration: ["1Attack:mwak", "1Attack:msak"]
            }
        }
    }];

    await props.tokenData.actor.createEmbeddedDocuments("ActiveEffect", effectData);
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
        name:  `Absorb Elements`,
        state: args[0] || ``,

        actorData:  tokenData.actor || {},
        itemData:   lastArg.item,
        spellLevel: lastArg.spellLevel,
        tokenData,

        lastArg,

        elements: {
            acid:      "acid",
            cold:      "cold",
            fire:      "fire",
            lightning: "lightning",
            thunder:   "thunder"
        }
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
