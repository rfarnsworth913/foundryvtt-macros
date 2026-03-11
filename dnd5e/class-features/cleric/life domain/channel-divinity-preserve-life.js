/* ==========================================================================
    Macro:         Channel Divinity: Preserve Life
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Channel Divinity: Preserve Life",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    animations: {
        heal: "jb2a.cure_wounds.400px.green",
    },
    targets: lastArg.hitTargets || [],

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Validation Logic -----------------------------------------------------------
if (props.targets.length === 0) {
    return ui.notifications.error("No valid targets for Channel Divinity: Preserve Life.");
}

const filteredTargets = filterTargets({ targets: props.targets, creatureTypes: ["construct", "undead"] });
if (filteredTargets.length === 0) {
    return ui.notifications.error("No valid character targets for Channel Divinity: Preserve Life.");
}

// Healing Logic --------------------------------------------------------------
const healingAmount = props.actorData.classes.cleric.system.levels * 5;
renderDialog(filteredTargets, healingAmount);


/* ==========================================================================
    Dialog Handlers
   ========================================================================== */

// eslint-disable-next-line max-lines-per-function
function renderDialog (targets, healing) {

    // Extract actor images for the dialog ------------------------------------
    const actorImages = [];
    targets.forEach((actorData) => {
        const image = actorData.texture?.src || "";
        const maxHeal = Math.round(actorData.actor.system.attributes.hp.max / 2 - actorData.actor.system.attributes.hp.value);

        if (maxHeal <= 0) {
            return;
        }

        actorImages.push(`
            <label for="${actorData.uuid}" class="radio-label">
                <img src="${image}" style="border: 0; width: 50px; height: 50px;" />
                <span>${actorData.name}</span>
                <div class="input-group">
                    <input type="number" id="${actorData.uuid}" data-max-heal="${maxHeal}" name="preserveLifeTarget" value="0" /> <strong>/ ${maxHeal}</strong>
                </div>
            </label>
        `);
    });

    if (actorImages.length === 0) {
        return ui.notifications.error("No targets have lost enough hit points for healing.");
    }

    // Render the dialog for selecting healing amounts ------------------------
    return new Dialog({
        title: "Channel Divinity: Preserve Life",
        content: `
            <style>
                #preserveLife .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                }

                #preserveLife label {
                    display: flex;
                    align-items: center;
                    flex: 0 0 100%;
                }

                #preserveLife span {
                    padding: 0 7px;
                    flex-grow: 2;
                }

                #preserveLife img {
                    border: 0;
                    width: 50px;
                    height: 50px;
                    flex: 0 0 50px;
                }

                #preserveLife input {
                    max-width: 50px;
                }
            </style>
            <header>
                <h3>Choose targets to heal</h3>
            </header>

            <section>
                <p><strong>Healing Amount:</strong> ${healing}</p>
            </section>

            <hr />
            <form id="preserveLife">
                <div class="form-group">
                    ${actorImages.join("")}
                </div>
            </form>
            <hr />
        `,
        buttons: {
            heal: {
                label: "Heal",
                callback: async (html) => {

                    // Extract form data --------------------------------------
                    let totalHealing = 0;
                    const targets = html.find("input[name='preserveLifeTarget']").filter((i, el) => {
                        return Number(el.value) > 0;
                    }).map((i, el) => {
                        totalHealing += Number(el.value);

                        return {
                            uuid: el.id,
                            name: fromUuidSync(el.id).name,
                            healAmount: Number(el.value),
                            maxAllowed: Number(el.dataset.maxHeal)
                        };
                    });

                    // Validate healing ---------------------------------------
                    if (totalHealing > healing) {
                        ui.notifications.error("Total healing exceeds the maximum allowed by Channel Divinity: Preserve Life.");
                        renderDialog(targets, healing);
                    }

                    for (const target of targets) {
                        if (target.healAmount > target.maxAllowed) {
                            ui.notifications.error(`Healing amount for ${target.name} exceeds the maximum allowed.`);
                            renderDialog(targets, healing);
                        }
                    }

                    // Update target health -----------------------------------
                    for (const target of targets) {
                        const healingRoll = await new CONFIG.Dice.DamageRoll(`${target.healAmount}`, {}, { type: "healing" }).evaluate();

                        await new MidiQOL.DamageOnlyWorkflow(
                            actor,
                            token,
                            healingRoll.total,
                            "healing",
                            [await fromUuidSync(target.uuid)],
                            healingRoll,
                            {
                                flavor: "healing",
                                itemCardUuid: fromUuidSync(props.lastArg.sourceItemUuid)
                            }
                        );

                        healAnimation(target);
                    }
                }
            },

            cancel: {
                label: "Cancel",
                callback: async () => {
                    console.log("Channel Divinity: Preserve Life canceled");
                    const channelDivinity = await getItems({ actorData: props.actorData, itemLabel: "Channel Divinity" });
                    const updates = [{ _id: channelDivinity[0].id, "system.uses.spent": channelDivinity[0].system.uses.spent - 1 }];
                    await updateItem({ actorData: props.actorData, updates });
                }
            }
        }
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

        // Check invalid target
        const validTarget = target.actor.type === "character" ?
            creatureTypes.some((creatureType) => {
                return !target.actor.system.details.race.name.toLowerCase().includes(creatureType);
            }) :
            creatureTypes.some((creatureType) => {
                return !target.actor.system.details.type.value.toLowerCase().includes(creatureType);
            });

        if (validTarget) {
            targetsList.push(target);
        }

        return targetsList;
    }, []);
}

/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
}

/**
 * Updates a collection of items on the specified actor
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {Array}     updates     Updates to be applied
 * @returns  Array<Actor>            Actors that have been updated
 */
async function updateItem ({ actorData, updates } = {}) {
    if (!actorData) {
        return console.error("No item specified");
    }

    return await actorData.updateEmbeddedDocuments("Item", updates);
}

/**
 * Handles playing the animation tied to the effect
 *
 * @param {Token} target  The target token to play the animation on
 */
function healAnimation (target) {
    if (!game.modules.get("sequencer")?.active) {
        return false;
    }

    new Sequence()
        .effect()
            .attachTo(target)
            .file(props.animations.heal)
            .fadeIn(300)
            .fadeOut(300)
        .play();
}
