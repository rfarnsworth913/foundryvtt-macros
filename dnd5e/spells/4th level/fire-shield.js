/* ==========================================================================
    Macro:         Fire Shield
    Source:        Custom
    Usage:         DAE Item Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Fire Shield",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    description: "Choose the type of shield to apply.",
    resistances: ["Cold", "Fire"],

    animation: {
        cold: {
            intro: "jb2a.shield.01.intro.blue",
            loop: "jb2a.shield.01.loop.blue",
            outro: "jb2a.shield.01.outro_explode.blue"
        },
        fire: {
            intro: "jb2a.shield.01.intro.red",
            loop: "jb2a.shield.01.loop.red",
            outro: "jb2a.shield.01.outro_explode.red"
        }
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "on") {

    // Create dialog content ------------------------------------------------------
    const dialogContent = props.resistances.reduce((acc, resistance) => {
        // eslint-disable-next-line no-param-reassign
        acc += `
        <label for="${resistance}" class="radio-label">
            <input type="radio" name="resistance" id="${resistance}" value="${resistance}" />
            <span>${resistance}</span>
        </label>
    `;

        return acc;
    }, "");


    // Request shield to apply ----------------------------------------------------
    new Dialog({
        title: `${props.name} Type`,
        content: `
        <style>
                #fieldShield .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                    max-height: 400px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    margin-bottom: 15px;
                }

                #fieldShield .radio-label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    text-align: center;
                    justify-content: flex-start;
                    flex: 0 0 100%;
                    line-height: normal;
                    padding: 5px;
                    cursor: pointer;
                }

                #fieldShield input {
                    top: 0;
                    margin: 0 0.5rem;
                }
            </style>
            <form id="fieldShield">
                ${props.description}
                <hr />
                <div class="form-group">
                    ${dialogContent}
                </div>
            </form>
    `,
        buttons: {
            apply: {
                label: "Apply",
                callback: async (html) => {
                    // Update effect ----------------------------------------------------
                    const resistance = html.find("input[name='resistance']:checked").val();
                    const effect = await getEffect({
                        actorData: props.actorData,
                        effectLabel: props.name
                    });

                    const updates = [{
                        _id: effect._id,
                        name: `${props.name} (${resistance})`,
                        changes: [
                            ...effect.changes,
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: resistance.toLowerCase(),
                                priority: 20
                            }
                        ]
                    }];

                    await updateEffects({
                        actorData: props.actorData,
                        updates
                    });

                    // Create Shield Item -----------------------------------------------
                    await createItem({
                        actorData: props.actorData,
                        itemLabel: `${props.name} (${resistance} Attack)`
                    });

                    // Create Fire Shield Animation -------------------------------------
                    playCastAnimation(resistance.toLowerCase());
                }
            },
            cancel: {
                label: "Cancel",
                callback: async () => {
                    await removeEffect({
                        actorData: props.actorData,
                        effectLabel: props.name
                    });
                }
            }
        }
    }).render(true);
}

if (props.state === "off") {
    // Remove attack item -----------------------------------------------------
    await removeItem({
        actorData: props.actorData,
        itemLabel: `${props.name} (Fire Attack)`
    });

    await removeItem({
        actorData: props.actorData,
        itemLabel: `${props.name} (Cold Attack)`
    });

    // Play Fade Animation ----------------------------------------------------
    const resistance = await getEffect({
        actorData: props.actorData,
        effectLabel: "Fire Shield (Cold)"
    });

    playEndAnimation(resistance.length > 0 ? "cold" : "fire");
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

function playCastAnimation (resistanceType) {
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file(props.animation[resistanceType].intro)
                .attachTo(props.tokenData)
                .scaleToObject(1.5)
                .waitUntilFinished(-500)
            .effect()
                .file(props.animation[resistanceType].loop)
                .attachTo(props.tokenData)
                .scaleToObject(1.5)
                .persist()
                .name(`FireShield-${props.tokenData.uuid}`)
                .fadeIn(300)
                .fadeOut(300)
                .extraEndDuration(800)
            .play();
    }
}

function playEndAnimation (resistanceType) {
    if (game.modules.get("sequencer")?.active) {
        Sequencer.EffectManager.endEffects({
            name: `FireShield-${props.tokenData.uuid}`,
            object: props.tokenData
        });

        new Sequence()
            .effect()
                .file(props.animation[resistanceType].outro)
                .attachTo(props.tokenData)
                .scaleToObject(1.5)
            .play();
    }
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
 * Updates an existing effect on a target actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  updates      Updates to be applied to the target
 * @returns  {Promise<Function>}           Update handler
 */
async function updateEffects ({ actorData, updates = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!updates || updates.length === 0) {
        return console.error("No updates specified");
    }

    return await MidiQOL.socket().executeAsGM("updateEffects", {
        actorUuid: actorData.uuid,
        updates
    });
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
 * Creates a specified item in the inventory of the target actor
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actor        Target actor
 * @param  {string}   itemLabel    Item to be created
 */
async function createItem ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const compendium = game.packs.get(props.compendiumID);
    const orgItem = await compendium.getDocuments({ name: itemLabel });

    if (orgItem.length === 0) {
        return console.error("Specified item cannot be found!");
    }

    const itemData = foundry.utils.duplicate(orgItem[0]);
    actorData.createEmbeddedDocuments("Item", [itemData]);
}

/**
 * Finds and removes an item from the specified actor's inventory
 *
 * @param    {Actor5e}  actorData  Actor to be operated on
 * @param    {String}   itemLabel  Item name to be removed from inventory
 * @returns  {Promise}             Removal handler
 */
async function removeItem ({ actorData, itemLabel = "" } = {}) {
    const getItem = actorData.items.find((item) => {
        return item.name === itemLabel;
    });

    if (!getItem) {
        return {};
    }

    return await actorData.deleteEmbeddedDocuments("Item", [getItem.id]);
}
