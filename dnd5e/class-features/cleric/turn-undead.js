/* ==========================================================================
    Macro:  Turn Undead
    Usage:  ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const actorData = await fromUuidSync(lastArg.uuid).getRollData() || {};

const props = {
    name: "Turn Undead / Destroy Undead",
    macroPass: lastArg.macroPass || "",
    state: args[0]?.tag || args[0] || "unknown",

    actorData,
    casterLevel: Number(actorData.details?.spellLevel || actorData.classes?.cleric?.levels || 0),
    itemData: lastArg?.item,
    itemUUID: lastArg?.uuid || lastArg?.itemUuid,
    saveType: actorData.attributes.spellcasting || "wis",
    spellDC: actorData.attributes.spell.dc,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" && props.macroPass === "postActiveEffects") {

    // Get target data --------------------------------------------------------
    const targetList = await Array.from(props.lastArg.targets).reduce((list, target) => {
        const creatureTypes = ["undead"];
        const targetData = target.actor.getRollData();
        const undead = creatureTypes.some((type) => {
            return ((targetData.details?.type?.custom || targetData.details?.type?.value) ||
                (targetData.details?.race?.name || targetData.details?.race))
                ?.toLowerCase()?.includes(type) || "";
        });

        if (undead) {
            list.push(target);
        }

        return list;
    }, []);

    if (targetList.length === 0) {
        console.error("❌ Shut Down Reason: No targets found!");
        return false;
    }


    // Process targets --------------------------------------------------------
    const turnTargets = [];

    for (const target of targetList) {
        const targetData = await target.actor.getRollData();
        const monsterCR = targetData.details.cr;
        const levelCR = getDestroyCR(props.casterLevel);

        const resist = ["Turn Resistance", "Turn Defiance"];
        const getResistance = target.actor.itemTypes.feat.find((feat) => {
            return resist.includes(feat.name);
        });

        const immunity = ["Turn Immunity"];
        const getImmunity = target.actor.itemTypes.feat.find((feat) => {
            return immunity.includes(feat.name);
        });

        const getAdvantage = {
            advantage: getResistance ? true : false,
            chatMessage: false,
            fastForward: true
        };

        const save = await MidiQOL.socket().executeAsGM("rollAbilityV2", {
            request: "save",
            targetUuid: target.actor.uuid,
            ability: props.saveType,
            options: getAdvantage
        });

        if (getImmunity) {
            logImmune(target.name, monsterCR, "Immune");
            turnTargets.push(`
                <div class="midi-qol-flex-container">
                    <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} is immune</div>
                    <div><img src="${target.actor.prototypeToken.texture.src}" width="30" height="30" style="border:0px"></div>
                </div>`);
        } else if (save[0].total < props.spellDC) {

            if (levelCR >= monsterCR) {
                // Target Destroyed -------------------------------------------
                logStatus(target.name, monsterCR, props.spellDC, save[0].total, "Fail", "Destroyed");
                turnTargets.push(getHTMLStructure(target, save, "is destroyed", "Destroyed"));
                const maxHP = Number(targetData.attributes.hp.max);
                const updates = {
                    "system.attributes.hp.value": 0,
                    "system.attributes.hp.max": maxHP
                };
                await target.actor.update(updates);
                await target.actor.toggleStatusEffect("dead", { active: true });

            } else {
                // Target Turned ----------------------------------------------
                logStatus(target.name, monsterCR, props.spellDC, save[0].total, "Fail", "Turned");
                const conditionFlags = {
                    dae: {
                        selfTarget: false,
                        token: target.uuid,
                        stackable: "noneOrigin",
                        durationExpression: "",
                        macroRepeat: "",
                        specialDuration: ["zeroHP", "isDamaged"],
                        transfer: false
                    }
                };

                const effectChanges = [
                    {
                        key: "flags.midi-qol.disadvantage.ability.check.all",
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 1,
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.skill.all",
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 1,
                        priority: 20
                    },
                    {
                        key: "flags.midi-qol.disadvantage.attack.all",
                        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        value: 1,
                        priority: 20
                    }
                ];

                const effectData = {
                    name: "Turned",
                    icon: props.itemData.img,
                    origin: props.itemUUID,
                    disabled: false,
                    transfer: false,
                    flags: conditionFlags,
                    duration: {
                        seconds: 60,
                        rounds: 10,
                        startRound: game.combat ? game.combat.round : 0,
                        startTime: game.time.worldTime
                    },
                    changes: effectChanges
                };

                const effect = await getEffect({ actorData: target.actor, effectLabel: "Turned" });

                if (!effect) {
                    await MidiQOL.socket().executeAsGM("createEffects", {
                        actorUuid: target.actor.uuid,
                        effects: [effectData]
                    });
                }

                turnTargets.push(getHTMLStructure(target, save, "fails with", "Turned"));
            }
        } else {
            turnTargets.push(getHTMLStructure(target, save, "succeeds with", "Saved"));
        }

        await wait(300);

        // Log information to the chat --------------------------------------------
        const turnResults = `
            <div class="midi-qol-nobox midi-qol-bigger-text">
                ${CONFIG.DND5E.abilities[props.saveType]?.label} Saving Throw: DC ${props.spellDC}
            </div>
            <div>
                <div class="midi-qol-nobox">${turnTargets.join("")}</div>
            </div>`;

        const chatMessage = await game.messages.get(props.lastArg.itemCardUuid.replace("ChatMessage.", ""));
        let content = await foundry.utils.duplicate(chatMessage.content);
        const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
        const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turnResults}`;
        content = await content.replace(searchString, replaceString);
        await chatMessage.update({ content: content });
        await ui.chat.scrollBottom();
    }
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

function logImmune (name, cr, result) {
    console.log(`➡️ %cTarget Status: ${name} | CR: ${cr} | Result: ${result}`);
}

function logStatus (name, cr, dc, save, status, result) {
    console.log(`➡️ %cTarget Status: ${name} | CR: ${cr} | DC: ${dc} | Save: ${save} [${status}] | Result: ${result}`);
}

function getHTMLStructure (target, save, text, label) {
    return `
        <div class="flexrow">
            <div style="flex: 0 0 30px; margin-right: 5px;">
                <img src="${target.actor.prototypeToken.texture.src}" width="30" height="30" style="border:0px">
            </div>
            <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                ${target.name} ${text} ${save[0].total} [${label}]
            </div>
        </div>`;
}

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

/**
 * Returns the maximum CR that can be destroyed when using Turn Undead
 *
 * @param  {number}  level  Character's cleric levels
 * @returns                 Maximum CR that can be destroyed
 */
function getDestroyCR (level) {
    return level > 20 ? 5 :
        level >= 17 ? 4 :
        level >= 14 ? 3 :
        level >= 11 ? 2 :
        level >= 8 ? 1 :
        level >= 5 ? 0.5 : 0;
}

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });
}
