/* eslint-disable max-lines-per-function */
/* ==========================================================================
    Macro:         Lay on Hands
    Source:        https://www.patreon.com/posts/lay-on-hands-61887734
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Lay on Hands",
    state: args[0]?.macroPass || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.item || {},
    tokenData,

    target: await fromUuidSync(lastArg.targetUuids[0]),

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
const uses = props.itemData.system.uses.max - props.itemData.system.uses.spent;

const targetHP = props.target.actor.system.attributes.hp.value;
const targetMaxHP = props.target.actor.system.attributes.hp.max;
const conditionList = ["Diseased", "Poisoned"];
const conditionEffects = props.target?.actor?.effects?.filter((effect) => {
    return conditionList.includes(effect?.name || effect?.label || effect?.data?.label);
});


// Validate Macro State -------------------------------------------------------
if (props.state === "preItemRoll") {

    try {

        // Check for target ---------------------------------------------------
        if (!props.target) {
            throw Error("Featured Cancelled: No target found");
        }

        // Check for charges --------------------------------------------------
        if (uses === 0) {
            throw Error("Featured Cancelled: No charges left");
        }

        // Check for creature type --------------------------------------------
        const creatureTypes = ["undead", "construct"];
        const filteredTargets = await filterTargets({ targets: [props.target], creatureTypes });
        if (filteredTargets.length === 0) {
            throw Error("Featured Cancelled: Target is undead or construct");
        }

        // Check HP and Conditions --------------------------------------------
        if ((targetHP === targetMaxHP) && (conditionEffects.length === 0)) {
            throw Error("Featured Cancelled: Target is at full health or is not effected by a condition");
        }

    } catch (error) {
        ui.notifications.error(`❌ ${error.message}.`);
        return false;
    }

}

// Handle Selecting Healing Action --------------------------------------------
if (props.state === "postActiveEffects") {

    // Dialog Box Rendering ---------------------------------------------------
    const buttonLayout = {};

    if (conditionEffects.length > 0 && Math.floor(uses / 5) > 0) {
        buttonLayout["cure"] = {
            label: "Cure Condition",
            callback: () => {
                cureCondition();
            }
        };
    }

    if (targetHP < targetMaxHP) {
        buttonLayout["heal"] = {
            label: "Heal",
            callback: () => {
                healTarget();
            }
        };
    }

    buttonLayout["cancel"] = {
        label: "Cancel",
        callback: async () => {
            const chatMessage = game.messages.get(props.lastArg.chatMessageId);
            await chatMessage.delete();
        }
    };

    new Dialog({
        title: props.itemData.name,
        content: `<p>Which <b>Action</b> would you like to do? [${uses}] points remaining.</p>`,
        buttons: buttonLayout,
        default: "cancel",
    }).render(true);

}

/**
 * Handles curing the specified condition
 */
function cureCondition () {

    // Define Conditions to Cure ----------------------------------------------
    const selectOptions = props.target.actor.effects.reduce((list, condition) => {
        if (conditionList.includes(condition.name)) {
            list.push(`<option value="${condition.name}">${condition.name}</option>`);
        }

        return list;
    }, []);

    if (selectOptions.length === 0) {
        return ui.notifications.error("No conditions found on target");
    }

    const dialogContent = `
        <style>
            button.dialog-button {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            button img {
                margin-right: 10px;
            }
        </style>
        <p>
            <em>${props.tokenData.name} ${props.itemData.name} on ${props.target.name}.</em>
        </p>
        <p>Choose a Condition Cure | [${uses}/${props.itemData.system.uses.max}] charges left.</p>
    `;

    let element;
    const dialogButtons = props.target.actor.effects.reduce((list, effect) => {
        if (conditionList.includes(effect.name)) {
            list[`${effect.name}`] = {
                label: effect.name,
                icon: `<img style="border:none;" src="${effect.icon}" width="30" height="30" style="margin-right: 10px;">`,
                callback: () => {
                    element = effect.name;
                }
            };
        }

        return list;
    }, []);

    // Render Cure Dialog -----------------------------------------------------
    new Dialog({
        title: `${props.itemData.name} | Cure Condition`,
        content: dialogContent,
        buttons: dialogButtons,
        close: async (html) => {
            if (!element) {
                return;
            }

            // Remove Effect and update Item
            await removeEffect({ actorData: props.target.actor, effectLabel: element });
            await updateItem(5);
        }
    }).render(true);
}

function healTarget () {

    // Create Dialog Box ------------------------------------------------------
    const maxHeal = Math.clamped(uses, 0, targetMaxHP - targetHP);

    const dialogContent = `
        <p>
            <em>${props.tokenData.name} lays hands on ${props.target.name}.</em>
        </p>
        <p>How many HP do you want to restore to ${props.target.name}?</p>
        <form class="flexcol">
            <div class="form-group">
                <label for="num">HP to Restore: (Max = ${maxHeal})</label>
                <input id="num" name="num" type="number" min="0" max="${maxHeal}"></input>
            </div>
        </form>
    `;

    new Dialog({
        title: `${props.itemData.name} | Heal Target`,
        content: dialogContent,
        buttons: {
            heal: {
                label: "Heal",
                icon: "<i class=\"fas fa-check\"></i>",
                callback: async (html) => {
                    const number = Math.floor(Number(html.find("#num")[0].value));

                    if (number < 1 || number > maxHeal) {
                        return ui.notifications.error(`Invalid number of charges entered = ${number}. Aborting action.`);
                    }

                    const damageRoll = await new CONFIG.Dice.DamageRoll(`${number}`, {}, { type: "healing" }).evaluate();
                    await new MidiQOL.DamageOnlyWorkflow(
                        actor,
                        token,
                        damageRoll.total,
                        "healing",
                        [props.target],
                        damageRoll,
                        {
                            flavor: "(Healing)",
                            itemCardId: props.lastArg.itemCardId
                        }
                    );

                    await updateItem(number);
                }
            },
            close: {
                label: "Cancel",
                callback: async () => {
                    const chatMessage = game.messages.get(props.lastArg.chatMessageId);
                    await chatMessage.delete();
                }
            }
        },
        default: "heal"
    }).render(true);
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
 * Filters a target list by creature type
 *
 * @param    {object}          [options]
 * @param    {Array<Actor5e>}  targets        Targets list to be filtered
 * @param    {Array<string>}   creatureTypes  Creature types to filter by
 * @returns                                   Filtered list of targets
 */
function filterTargets ({ targets = [], creatureTypes = [] }) {

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
                return target.actor.system.details.race.toLowerCase().includes(creatureType);
            }) :
            creatureTypes.some((creatureType) => {
                return target.actor.system.details.type.value.toLowerCase().includes(creatureType);
            });

        if (!validTarget) {
            targetsList.push(target);
        }

        return targetsList;
    }, []);
}

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects: [effect.id]
    });
}

/**
 * Handles updating item uses
 *
 * @param    {object}   [options]
 * @param    {Item}     itemData     Item to be updated
 * @param    {number}   effectLabel  Change in number of uses
 */
function updateItem (spent) {
    props.lastArg.workflow.item.update({ "system.uses.spent": props.itemData.system.uses.spent + spent });
}
