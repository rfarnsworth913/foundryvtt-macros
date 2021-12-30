/* ==========================================================================
    Macro:              Turn Undead
    Description:        Handles Turn and Destroy Undead
    Source:             https://www.patreon.com/posts/channel-divinity-49814315
    Usage:              OnUse
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Setup and validation ---------------------------------------------------
    const ActorUpdate = game.macros.getName("ActorUpdate");
    if (!ActorUpdate) {
        return ui.notifications.error(`Required: Missing Actor Update Macro!`);
    }

    let AdvancedMacros = getProperty(ActorUpdate.data.flags, "advanced-macros");
    if (!AdvancedMacros) {
        return ui.notifications.error(`Required: Macro required Advanced Macros!`);
    } else if (!AdvancedMacros.runAsGM) {
        return ui.notifications.error(`Required: ActorUpdate must run as GM!`);
    }


    // Get target information -------------------------------------------------
    const targetList = props.lastArg.targets.reduce((list, target) => {
        if (target.actor.data.data.attributes.hp.value === 0) {
            return list;
        }

        let creatureTypes = ["undead"];
        let undead = creatureTypes.some(i => (target.actor.data.data.details?.type?.value || target.actor.data.data.details?.race).toLowerCase().includes(i));
        console.log(`${props.item.name} => `, target.name, undead);
        if (undead) {
            list.push(target);
        }

        return list;
    }, []);

    const turnTargets = [];

    for (let target of targetList) {
        let monsterCR = target.actor.getRollData().details.cr;
        let levelCR   = await crLookup(props.level);
        console.log(`Monster CR: ${monsterCR} | Destroy CR: ${levelCR}`);

        // Check for resistance and immunity
        let resist        = ["Turn Resistance", "Turn Defiance"];
        let getResistance = target.actor.items.find(i => resist.includes(i.name));

        let immunity    = ["Turn Immunity"];
        let getImmunity = target.actor.items.find(i => immunity.includes(i.name));

        let getAdvantage = getResistance ? { advantage: true, chatMessage: false, fastForward: true } :{ chatMessage: false, fastForward: true };
        let save         = await MidiQOL.socket().executeAsGM("rollAbility", {
            request: "save",
            targetUuid: target.actor.uuid,
            ability: props.saveType,
            options: getAdvantage
        });

        // Handle Immunity condition ------------------------------------------
        if (getImmunity) {
            turnTargets.push(await getTargetHTML(target, `${target.name} is immune`));

        // Start handling save conditions -------------------------------------
        } else {

            // Start handling fail conditions ---------------------------------
            if (props.dc > save.total) {

                // Target is destroyed ----------------------------------------
                if (levelCR >= monsterCR) {
                    console.log(target.name, save.total, `Fail [Destroyed]`);
                    ActorUpdate.execute(target.id, { "data.attributes.hp.value": 0 });
                    turnTargets.push(await getTargetHTML(target, `${target.name} fails with ${save.total} [D]`));

                // Target is feared -------------------------------------------
                } else {
                    console.log(target.name, save.total, `Fail [Feared]`);
                    let gameRound = game.combat ? game.combat.round : 0;
                    let effectData = {
                        label:    "Frightened",
                        icon:     "icons/svg/terror.svg",
                        origin:   props.lastArg.uuid,
                        disabled: false,
                        flags: {
                            dae: {
                                specialDuration: ["isDamaged"]
                            }
                        },
                        duration: {
                            rounds: 10,
                            seconds: 60,
                            startRound: gameRound,
                            startTime:  game.time.worldTime
                        },
                        changes: [
                            {
                                key:      "flags.midi-qol.disadvantage.ability.check.all",
                                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:    1,
                                priority: 20
                            },
                            {
                                key:      "flags.midi-qol.disadvantage.skill.all",
                                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:    1,
                                priority: 20
                            },
                            {
                                key:      "flags.midi-qol.disadvantage.attack.all",
                                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:    1,
                                priority: 20
                            },
                        ]
                    };

                    let effect = target.actor.effects.find(ef => ef.data.label === game.i18n.localize("Frightened"));
                    if (!effect) {
                        await MidiQOL.socket().executeAsGM("createEffects", {
                            actorUuid: target.actor.uuid,
                            effects:   [effectData]
                        });
                    }

                    turnTargets.push(await getTargetHTML(target, `${target.name} fails with ${save.total} [F]`));
                }

            // Handle target saves --------------------------------------------
            } else {
                console.log(target.name, save.total, "Save");
                turnTargets.push(await getTargetHTML(target, `${target.name} saves with ${save.total}`));
            }
        }
    }


    // Output User Information ------------------------------------------------
    await wait(600);

    let chatMessage = await game.messages.get(props.lastArg.itemCardId);
    let turnResults = `
        <div class="midi-qol-nobox midi-qol-bigger-text">
            ${CONFIG.DND5E.abilities[props.saveType]} Saving Throw: DC ${props.dc}
        </div>
        <div>
            <div class="midi-qol-nobox">
                ${turnTargets.join("")}
            </div>
        </div>
    `;

    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class=\"midi-qol-hits-display\">[\\s\\S]*<div class=\"end-midi-qol-hits-display\">/g;
    let replaceString = `<div class=\"midi-qol-hits-display\"><div class=\"end-midi-qol-hits-display\">${turnResults}`
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content });
    await ui.chat.scrollBottom();

})();

/**
 * Simple async wait function
 */
async function wait (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Performs a lookup of what CR can be effected by destroy undead
 */
async function crLookup (level) {
    return level >  20 ? 5 :
           level >= 17 ? 4 :
           level >= 14 ? 3 :
           level >= 11 ? 2 :
           level >= 8  ? 1 :
           level >= 5  ? 0.5 :
           null;
}

/**
 * Standardized formatting of target HTML output
 */
async function getTargetHTML (target, flavor) {
    return `
        <div class="midi-qol-flex-container">
            <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                ${flavor}
            </div>
            <div>
                <img src="${target.data.img}" width="30" height="30" style="border: 0px" />
            </div>
        </div>
    `;
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
    const actorData = game.actors.get(lastArg.actor._id).getRollData()

    return {
        name:     "Turn Undead",
        actor:    actorData,
        dc:       actorData.attributes.spelldc,
        item:     lastArg.item,
        level:    actorData.classes.cleric ? actorData.classes.cleric.levels : actorData.details.cr,
        saveType: actorData.attributes.spellcasting,

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
