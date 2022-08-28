/* ==========================================================================
    Macro:         Turn Undead
    Source:        https://www.patreon.com/posts/channel-divinity-49814315
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};
const rollData  = tokenData.actor.getRollData();

const props = {
    name: "Turn Undead",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.item,
    rollData,
    tokenData,

    level:    rollData.details.cr ?? rollData.classes.cleric.levels,
    saveDC:   rollData.attributes.spelldc,
    saveType: rollData.attributes.spellcasting,
    targets:  lastArg.targets
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Get target information -----------------------------------------------------
const targetList = await filterTargets({
    targets:       props.targets,
    creatureTypes: ["undead"]
});

// Check target list ----------------------------------------------------------
if (targetList.length === 0) {
    ui.notifications.warn(`${props.itemData.name} was unable to find any valid targets`);
    console.error(`${props.itemData.name} was unable to find any valid targets`);
    return false;
}

// Handle turning targets -----------------------------------------------------
const turnTargets = [];
const levelCR     = await getDestroyCR(props.level);
const gameRound   = game.combat ? game.combat.round : 0;

for (const target of targetList) {
    const monsterCR     = target.actor.getRollData().details.cr;
    const resist        = ["Turn Resistance", "Turn Defiance"];
    const getResistance = target.actor.items.find((item) => {
        return resist.includes(item.name);
    });

    const immunity = ["Turn Immunity"];
    const getImmunity = target.actor.items.find((item) => {
        return immunity.includes(item.name);
    });

    const getAdvantage = getResistance ?
        { advantage: true, chatMessage: false, fastForward: true } :
        { chatMessage: false, fastForward: true };

    // eslint-disable-next-line no-await-in-loop
    const save = await MidiQOL.socket().executeAsGM("rollAbility", {
        request:    "save",
        targetUuid: target.actor.uuid,
        ability:    props.saveType,
        options:    getAdvantage
    });

    if (getImmunity) {
        console.warn(`Target Processed: ${target.name} | CR: ${monsterCR} | Result: Immune`);
        turnTargets.push(`
            <div class="midi-qol-flex-container">
                <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                    ${target.name} is immune
                </div>
                <div>
                    <img src="${target.data.img}" width="30" height="30" style="border:0px">
                </div>
            </div>`
        );
    } else {

        if (save.total < props.saveDC) {
            if (levelCR >= monsterCR) {
                logInfo(target.name, monsterCR, props.saveDC, save.Total, "Fail", "Destroyed");
                turnTargets.push(`
                    <div class="midi-qol-flex-container">
                        <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                            ${target.name} fails with ${save.total} [D]
                        </div>
                        <div>
                            <img src="${target.data.img}" width="30" height="30" style="border:0px">
                        </div>
                    </div>
                `);
                const maxHP = Number(target.actor.data.data.attributes.hp.max);
                const updates = {
                    actor: {
                        "data.attributes.hp.value": 0,
                        "data.attributes.hp.max":   maxHP
                    }
                };

                // eslint-disable-next-line no-await-in-loop
                await warpgate.mutate(target, updates, "", { permanent: true, description: "Target was destroyed!" });

                playAnimation(target, "death");
            } else {
                logInfo(target.name, monsterCR, props.saveDC, save.Total, "Fail", "Frightened");
                turnTargets.push(`
                    <div class="midi-qol-flex-container">
                        <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                            ${target.name} fails with ${save.total} [F]
                        </div>
                        <div>
                            <img src="${target.data.img}" width="30" height="30" style="border:0px">
                        </div>
                    </div>
                `);

                const effectData = {
                    label:    props.itemData.name,
                    icon:     props.itemData.img,
                    origin:   lastArg.uuid,
                    disabled: false,
                    flags: {
                        dae: {
                            specialDuration: ["isDamaged"]
                        }
                    },
                    duration: {
                        seconds:    60,
                        rounds:     10,
                        startRound: gameRound,
                        startTime:  game.time.worldTime
                    },
                    changes: [
                        {
                            key:      "macro.CE",
                            mode:     0,
                            prioirty: 20,
                            value:    "Frightened"
                        }
                    ]
                };

                // eslint-disable-next-line no-await-in-loop
                await MidiQOL.socket().executeAsGM("createEffects", {
                    actorUuid: target.actor.uuid,
                    effects:   [effectData]
                });

                playAnimation(target, "fear");
            }
        } else {
            logInfo(target.name, monsterCR, props.saveDC, save.Total, "Skipped", "Save");
            turnTargets.push(`
                <div class="midi-qol-flex-container">
                    <div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">
                        ${target.name} saves with ${save.total}
                    </div>
                    <div>
                        <img src="${target.data.img}" width="30" height="30" style="border:0px">
                    </div>
                </div>
            `);
        }
    }
}

// Finalize Ability -----------------------------------------------------------
warpgate.wait(600);
const turnResults = `
    <div class="midi-qol-nobox midi-qol-bigger-text">
        ${CONFIG.DND5E.abilities[props.saveType]} Saving Throw: DC ${props.saveDC}
    </div>
    <div>
        <div class="midi-qol-nobox">${turnTargets.join("")}
    </div>
</div>`;
const chatMessage = await game.messages.get(lastArg.itemCardId);
let content       = await duplicate(chatMessage.data.content);

const searchString  = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${turnResults}`;
content = await content.replace(searchString, replaceString);

await chatMessage.update(({ content }));
await ui.chat.scrollBottom();


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

function logInfo (name, cr, dc, save, status, result) {
    console.warn(`Target Skipped: ${name} | CR: ${cr} | DC: ${dc} | Save: ${save} [${status}] | Result: ${result}`);
}

/**
 * Gets the level of destroy undead supported from the source character
 *
 * @param    {number}  level  CR or Cleric level of the actor
 * @returns  {number}         Max CR destroyed by actor
 */
async function getDestroyCR (level) {
    return level > 20 ? 5 :
        level >= 17 ? 4 :
            level >= 14 ? 3 :
                level >= 11 ? 2 :
                    level >= 8 ? 1 :
                        level >= 5 ? 0.5 : 0;
}

/**
 * Filters a target list by creature type
 *
 * @param    {object}          [options]
 * @param    {Array<Actor5e>}  targets        Targets list to be filtered
 * @param    {Array<string>}   creatureTypes  Creature types to filter by
 * @returns                                   Filtered list of targets
 */
async function filterTargets ({ targets = [], creatureTypes = [] }) {

    // Check inputs -----------------------------------------------------------
    if (targets.length === 0) {
        return targets;
    }

    if (creatureTypes.length === 0) {
        ui.notifications.error("No creature types were specified for filtering!");
        return targets;
    }

    // Create filtered targets list -------------------------------------------
    return targets.reduce((targetsList, target) => {

        // Check valid target
        const validTarget = target.actor.type === "character" ?
            creatureTypes.some((creatureType) => {
                return target.actor.data.data.details.race.toLowerCase().includes(creatureType);
            }) :
            creatureTypes.some((creatureType) => {
                return target.actor.data.data.details.type.value.toLowerCase().includes(creatureType);
            });

        if (validTarget) {
            targetsList.push(target);
        }

        return targetsList;
    }, []);
}

/**
 * Plays animation based upon the effect being applied on the specified target
 *
 * @param  {Token5e}  target  Target for animation
 * @param  {string}   mode    Animation type to be played
 */
function playAnimation (target, mode) {
    const animation = mode === "fear" ?
        "jb2a.toll_the_dead.purple.skull_smoke" :
        "jb2a.explosion.03.bluewhite";

    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file(animation)
                .attachTo(target)
                .scaleToObject(2)
            .play();
    }
}
