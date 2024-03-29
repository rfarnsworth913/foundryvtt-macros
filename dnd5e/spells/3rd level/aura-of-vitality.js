/* ==========================================================================
    Macro:         Aura of Vitality
    Source:        Source
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Aura of Vitality",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  await fromUuidSync(lastArg.origin),
    tokenData,

    animations: {
        heal:  "jb2a.cure_wounds.400px.green",
        whirl: "jb2a.particles.swirl.greenyellow.01.01"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    healAnimation();
    await heal(props.tokenData);
}

if (props.state === "each") {
    await heal(props.tokenData);
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

// eslint-disable-next-line max-lines-per-function
async function heal (target) {

    // Get all possible heal targets ------------------------------------------
    const targetList = await MidiQOL.findNearby(null, target, 30, { includeIncapacitated: true, canSee: false });
    targetList.push(target);

    targetList.filter((i) => {
        const rollData = i.actor.getRollData();

        return i.actor.prototypeToken.disposition !== CONST.TOKEN_DISPOSITIONS.HOSTILE &&
            (rollData.attributes.hp.value < rollData.attributes.hp.max) &&
            ((rollData.details?.type?.custom) ||
            (rollData.details?.type?.value) ||
            (rollData.details?.race)) !== "NoTarget";
    }).sort((a, b) => {
        const aActor = a.actor.getRollData();
        const bActor = b.actor.getRollData();

        return (aActor.attributes.hp.max - aActor.attributes.hp.value) < (bActor.attributes.hp.max - bActor.attributes.hp.value) ? 1 : -1;
    }).sort((a, b) => {
        const aActor = a.actor.getRollData();
        const bActor = b.actor.getRollData();

        return aActor.attributes?.death?.failure < bActor.attributes?.death?.failure ? -1 : 1;
    });

    const itemList = targetList.reduce((acc, item) => {
        const actorData = item.actor.getRollData();

        return acc += `
            <option value="${item.document.uuid}">
                ${item.actor.name} | HP: [ ${actorData.attributes.hp.value} / ${actorData.attributes.hp.max} ]
            </option>`;
    }, "");

    // Heal Dialog Box --------------------------------------------------------
    const menu = await new Dialog({
        title:   props.name,
        content: `
            <div>
                <p>Use your <strong>Bonus Action</strong> to heal a target?</p>
            </div>
            <form>
                <div class="form-group">
                    <label for="target">Pick Target:</label>
                    <select id="target">${itemList}</select>
                </div>
            </form>
        `,
        buttons: {
            heal: {
                label: "Heal",
                // eslint-disable-next-line max-lines-per-function
                callback: async (html) => {
                    // Healing setup ------------------------------------------
                    const target = html.find("#target").val();
                    const itemUpdate = foundry.utils.mergeObject(duplicate(props.itemData), {
                        _id: null,
                        type: "spell",
                        effects: [],
                        flags: {
                            "midi-qol": {
                                noProvokeReaction: true,
                                onUseMacroName: null
                            }
                        },
                        system: {
                            actionType: "heal",
                            description: { value: `As a Bonus Action, one creature in your aura (including you) regain 2d6 hit points.` },
                            activation: { cost: 1, type: "bonus" },
                            properties: ["vocal"],
                            damage: { parts: [["2d6[healing]", "healing"]] },
                            target: { type: null, units: null, value: null, width: null },
                            preparation: { mode: "atwill", prepared: true },
                            range: { value: 30, long: null, units: "ft" }
                        }
                    }, {
                        overwrite: true,
                        inlace: true,
                        insertKeys: true,
                        insertValues: true
                    });

                    // Handle healing -----------------------------------------
                    const workflowItem = await new Promise((resolve) => {
                        setProperty(itemUpdate.flags, "autoanimations.killAnim", true);
                        const itemRoll = new CONFIG.Item.documentClass(itemUpdate, { parent: props.actorData });
                        const options = {
                            showFullCard: false,
                            createWorkflow: true,
                            versatile: false,
                            configureDialog: false,
                            targetUuids: [target],
                            workflowOptions: { "autoRollDamage": "always" }
                        };

                        // eslint-disable-next-line no-promise-executor-return
                        return resolve(MidiQOL.completeItemUse(itemRoll, {}, options));
                    });

                    targetAnimation(target);

                    // Update chat message ------------------------------------
                    await wait(500);
                    const getTarget = await fromUuidSync(target);
                    const targetResult = `
                        <div class="midi-qol-flex-container">
                            <div class="midi-qol-target-npc midi-qol-target-name" id="${getTarget.id}">
                                Heals ${getTarget.actor.name}
                            </div>
                            <div>
                                <img src="${getTarget.texture.src}" width="30" height="30" style="border:0px">
                            </div>
                        </div>`;
                    const chatMessage = await game.messages.get(workflowItem.itemCardId);
                    const content = await duplicate(chatMessage.content);
                    const sString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
                    const rString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${targetResult}`;

                    await content.replace(sString, rString);
                    chatMessage.update({ content });
                    await ui.chat.scrollBottom();
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {
                    return false;
                }
            }
        },
        default: "Cancel"
    });

    return menu.render(true);
}

if (props.state === "off") {
    if ((game.modules.get("sequencer")?.active) &&
        Sequencer.EffectManager.getEffectPositionByName(`Aura-of-Vitality-${props.tokenData.id}`)) {
        await Sequencer.EffectManager.endEffects({ name: `Aura-of-Vitality-${props.tokenData.id}`, object: props.tokenData });
    }

    return true;
}

/**
 * Handles playing the animation tied to the effect
 */
async function healAnimation () {
    if (!(game.modules.get("sequencer")?.active)) {
        return false;
    }

    const activeEffect = await getEffect({
        actorData:   props.actorData,
        effectLabel: props.name
    });

    new Sequence()
        .effect()
            .file(props.animations.whirl)
            .attachTo(props.tokenData)
            .fadeIn(400, { ease: "easeOutCirc", delay: 100 })
            .center()
            .randomRotation()
            .scaleToObject(8, { considerTokenScale: true })
            .belowTokens()
            .opacity(0.7)
            .persist()
            .template({ gridSize: 200, startPoint: 100, endPoint: 100 })
            .tieToDocuments([activeEffect, props.tokenData])
            .name(`Aura-of-Vitality-${props.tokenData.id}`)
        .play();
}

/**
 * Plays a simple animation on the target
 *
 * @param {string}  target  Target for the animation
 */
async function targetAnimation (target) {
    if (!(game.modules.get("sequencer")?.active)) {
        return false;
    }

    const targetToken = await fromUuidSync(target);

    new Sequence()
        .effect()
            .file(props.animations.heal)
            .scaleToObject(1.5)
        .atLocation(targetToken)
            .fadeIn(200)
            .fadeOut(200)
        .play();
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

    return (actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    }));
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
