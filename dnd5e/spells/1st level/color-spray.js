/* ==========================================================================
    Macro:         Color Spray
    Source:        Custom
    Usage:         ItemUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Color Spray",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    itemData: lastArg.item || {},
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    targets: lastArg.targets,

    colorSprayHP: await lastArg.damageRolls[0].total || 0,

    immuneConditions: [
        "blinded",
        "unconscious",
    ],

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Get targets ------------------------------------------------------------
    const targets = await props.targets.filter((target) => {
        return target.actor.getRollData().attributes.hp.value > 0;
    }).sort((a, b) => {
        return canvas.tokens.get(a.id).actor.getRollData().attributes.hp.value <
            canvas.tokens.get(b.id).actor.getRollData().attributes.hp.value ? -1 : 1;
    });

    let remainingHP = props.colorSprayHP;
    const affectedTargets = [];


    // Process each target ----------------------------------------------------
    targets.forEach(async (target) => {
        const targetData = target.actor.getRollData();

        const immuneCI = targetData.traits.ci.value.filter((trait) => {
            return props.immuneConditions.includes(trait);
        });

        const immuneCustom = props.immuneConditions.some((trait) => {
            return targetData.traits.ci.custom.toLowerCase().includes(trait);
        });

        const targetHPValue = targetData.attributes.hp.value;


        // Handle Immune Targets ----------------------------------------------
        if (immuneCI.length > 0 || immuneCustom) {
            affectedTargets.push(logTargetInfo(target, targetHPValue, "immune"));

        // Handle Slept Targets -----------------------------------------------
        } else if (remainingHP > targetHPValue) {
            remainingHP -= targetHPValue;
            affectedTargets.push(logTargetInfo(target, targetHPValue, "blinded"));

            const effectData = [{
                changes: [{
                    key: "macro.StatusEffect",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Blinded",
                    priority: 20
                }],
                name: "Color Spray - Blinded",
                img: props.itemData.img,
                origin: props.itemData.uuid,
                disabled: false,
                flags: {
                    dae: {
                        specialDuration: ["turnEndSource"],
                    }
                },
                duration: {
                    rounds: 2,
                    seconds: 12,
                    startRound: game.combat ? game.combat.round : 0,
                    startTime: game.time.worldTime
                }
            }];

            await createEffects({ actorData: target.actor, effects: effectData });

        // Handle Remaining Targets -------------------------------------------
        } else {
            affectedTargets.push(logTargetInfo(target, targetHPValue, "resists"));
        }

        // Update Chat --------------------------------------------------------
        const blindedList = affectedTargets.join("");
        const blindedResults = `<div><div class="midi-qol-nobox">${blindedList}</div></div>`;

        const chatMessage = game.messages.get(props.lastArg.itemCardId);
        let content = foundry.utils.duplicate(chatMessage.content);

        const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
        const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${blindedResults}`;
        content = await content.replace(searchString, replaceString);
        await chatMessage.update({ content: content });
    });
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

/**
 * Handles logging information about the specified target
 *
 * @param   {Actor5e}  target    Target Actor Data
 * @param   {number}   targetHP  Target's HP
 * @param   {string}   status    Resistance status
 * @return  {string}             Formatted data string
 */
function logTargetInfo (target, targetHP, status) {
    console.info(`Sleep Results => Target: ${target.actor.name} | HP: ${targetHP} | Status: ${status}`);
    return `
        <div class="midi-qol-flex-container">
            <div>${status}</div>
            <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                ${target.actor.name}
            </div>
            <div>
                <img src="${target.texture.src}" width="30" height="30" style="border:0px">
            </div>
        </div>
    `;
}

/**
 * Creates an effect on a selected actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  effects  Effects to be applied to target
 * @returns  {Promise<Function>}       Deletion status of effect
 */
async function createEffects ({ actorData, effects = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effects || effects.length === 0) {
        return console.error("No effects specified");
    }

    return await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actorData.uuid,
        effects
    });
}
