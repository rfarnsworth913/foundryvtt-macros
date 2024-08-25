/* ==========================================================================
    Macro:         Sleep
    Source:        https://www.patreon.com/posts/sleep-73239028
    Usage:         ItemUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Sleep",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.item,
    tokenData,

    sleepHP: await lastArg.damageTotal,
    immuneConditions: [
        "unconscious",
        "sleep",
        "charmed"
    ],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Get targets ------------------------------------------------------------
    const targets = await props.lastArg.targets.filter((target) => {
        return (target.actor.getRollData().attributes.hp.value > 0);
    }).sort((a, b) => {
        return canvas.tokens.get(a.id).actor.getRollData().attributes.hp.value <
            canvas.tokens.get(b.id).actor.getRollData().attributes.hp.value ? -1 : 1;
    });

    let remainingSleepHP = props.sleepHP;
    const sleepTargets = [];

    // Process each target ----------------------------------------------------
    targets.forEach(async (target) => {
        const targetData = target.actor.getRollData();

        const immuneType = ["undead", "construct"].some((creatureType) => {
            return (targetData.details?.race || targetData.details?.type?.value).toLowerCase().includes(creatureType);
        });
        const immuneCI = targetData.traits.ci.value.filter((trait) => {
            return props.immuneConditions.includes(trait);
        });
        const immuneCustom = props.immuneConditions.some((trait) => {
            return targetData.traits.ci.custom.toLowerCase().includes(trait);
        });
        const sleeping = target.actor.effects.find((effect) => {
            return effect.label === "Sleep" || effect.label === "Unconscious";
        });

        const targetHPValue = targetData.attributes.hp.value;

        // Handle Immune Targets ----------------------------------------------
        if (immuneType || immuneCI.length > 0 || immuneCustom || sleeping) {
            sleepTargets.push(logTargetInfo(target, targetHPValue, "immune"));

        // Handle Slept Targets -----------------------------------------------
        } else if (remainingSleepHP > targetHPValue) {
            remainingSleepHP -= targetHPValue;
            sleepTargets.push(logTargetInfo(target, targetHPValue, "slept"));

            if ((game.modules.get("dfreds-convenient-effects")?.active)) {
                const { uuid } = target.actor;
                game.dfreds.effectInterface.addEffect({
                    effectName: "Sleep",
                    uuid
                });
            }

        // Handle Remaining Targets -------------------------------------------
        } else {
            sleepTargets.push(logTargetInfo(target, targetHPValue, "resists"));
        }

        // Update Chat --------------------------------------------------------
        const sleptList = sleepTargets.join("");
        const sleptResults = `<div><div class="midi-qol-nobox">${sleptList}</div></div>`;

        const chatMessage = game.messages.get(props.lastArg.itemCardId);
        let content = foundry.utils.duplicate(chatMessage.content);

        const searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
        const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${sleptResults}`;
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
