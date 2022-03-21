/* ==========================================================================
    Macro:              Sleep
    Description:        Handles applying the sleep condition to all targets
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Spells/Level%201/Sleep.js
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Get target information -------------------------------------------------
    let targets = await props.targets.filter((target) => {
        return target.actor.data.data.attributes.hp.value !== 0 &&
                !target.actor.effects.find((effect) => {
                    return effect.data.label === "Unconscious"
                });
    }).sort((a, b) => {
        return canvas.tokens.get(a.id).actor.data.data.attributes.hp.value <
               canvas.tokens.get(b.id).actor.data.data.attributes.hp.value ? -1 : 1
    });

    let remainingSleepHP = props.sleepHP;
    let sleepTargets      = [];


    // Process targets --------------------------------------------------------
    for (let target of targets) {
        let findTarget = await canvas.tokens.get(target.id);
        let immuneType = findTarget.actor.data.type === "character" ?
            ["undead", "construct"].some((race) => {
                return (findTarget.actor.data.data.details.race || "").toLowerCase().includes(race);
            }) :
            ["undead", "construct"].some((value) => {
                return (findTarget.actor.data.data.details.type.value || "").toLowerCase().includes(value);
            });
        let immuneCI = findTarget.actor.data.data.traits.ci.custom.includes("Sleep");
        let sleeping = findTarget.actor.effects.find((effect) => {
            return effect.data.label === "Unconscious";
        });
        let targetHPValue = findTarget.actor.data.data.attributes.hp.value;

        // Handle Immunity ----------------------------------------------------
        if (immuneType || immuneCI || sleeping) {
            console.log(`Sleep Results => Target: ${findTarget.name} | HP: ${targetHPValue} | Status: Resists`);
            sleepTargets.push(`
                <div class="midi-qol-flex-container">
                    <div>resists</div>
                    <div class="midi-qol-target-npc midi-qol-target-name" id="${findTarget.id}">
                        ${findTarget.name}
                    </div>
                    <div>
                        <img src="${findTarget.data.img}" width="30" height="30" style="border: 0;" />
                    </div>
                </div>
            `);
            continue;
        }

        // Handle sleep -------------------------------------------------------
        if (remainingSleepHP >= targetHPValue) {
            remainingSleepHP -= targetHPValue;

            console.log(`Sleep Results => Target: ${findTarget.name} | HP: ${targetHPValue} | HP Pool: ${remainingSleepHP} | Status: Slept`);
            sleepTargets.push(`
                <div class="midi-qol-flex-container">
                    <div>slept</div>
                    <div class="midi-qol-target-npc midi-qol-target-name" id="${findTarget.id}">
                        ${findTarget.name}
                    </div>
                    <div>
                        <img src="${findTarget.data.img}" width="30" height="30" style="border: 0;" />
                    </div>
                </div>
            `);

            let gameRound = game.combat ? game.combat.round : 0;
            let effectData = {
                label:    props.itemData.name,
                icon:     props.itemData.img,
                origin:   props.uuid,
                disabled: false,
                duration: {
                    rounds:     10,
                    seconds:    60,
                    startRound: gameRound,
                    startTime:  game.time.worldTime
                },
                flags: {
                    dae: {
                        specialDuration: ["isDamaged"]
                    }
                },
                changes: [
                    {
                        key:      "macro.CUB",
                        mode:     0,
                        value:    "Unconscious",
                        priority: 20
                    }
                ]
            };

            await MidiQOL.socket().executeAsGM("createEffects", {
                actorUuid: findTarget.actor.uuid,
                effects:   [effectData]
            });

            continue;

        // Handle missing condition -------------------------------------------
        } else {
            console.log(`Sleep Results => Target: ${target.name} | HP: ${targetHPValue} | HP Pool: ${remainingSleepHP - targetHPValue} | Status: Missed`);
            sleepTargets.push(`
                <div class="midi-qol-flex-container">
                    <div>misses</div>
                    <div class="midi-qol-target-npc midi-qol-target-name" id="${findTarget.id}">
                        ${findTarget.name}
                    </div>
                    <div>
                        <img src="${findTarget.data.img}" width="30" height="30" style="border: 0;" />
                    </div>
                </div>
            `);
        }
    }


    // Output results ---------------------------------------------------------
    let sleptList = sleepTargets.join("");
    await wait (500);

    let sleptResults = `
        <div>
            <div class="midi-qol-nobox">${sleptList}</div>
        </div>
    `;
    let chatMessage = game.messages.get(props.itemCardID);
    let content     = duplicate(chatMessage.data.content);

    const searchString  = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${sleptResults}`;
    content             = await content.replace(searchString, replaceString);
    await chatMessage.update({ content });

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
        name:  `Sleep`,
        state: args[0] || ``,

        actorData: tokenData.actor || {},
        tokenData,

        itemData:   lastArg.item,
        itemCardID: lastArg.itemCardId,
        sleepHP:    lastArg.damageTotal,
        targets:    lastArg.targets,
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
