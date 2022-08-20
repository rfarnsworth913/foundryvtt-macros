/* ==========================================================================
    Macro:         Bardic Inspiration
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg    = args[args.length - 1];
const tokenData  = canvas.tokens.get(lastArg?.tokenId) || {};
const casterData = DAE.DAEfromUuid(lastArg.efData.origin.substring(0, lastArg.efData.origin.indexOf("Item") - 1));

const props = {
    name: "Bardic Inspiration",
    state: args[0]?.tag || args[0] || "unknown",

    // Bardic Inspiration Target
    actorData: tokenData?.actor || {},
    tokenData,
    inspirationDice: casterData.getRollData().scale.bard["bardic-inspiration"],
    itemData:        lastArg.efData.flags.dae.itemData,

    // Caster
    casterData,

    // Animation info
    animationID: `bardic-inspiration-${lastArg.tokenId}`,

    lastArg
};

logProps(props);


/* ==========================================================================
    Bardic Inspiration Core Controller(s)
   ========================================================================== */

// Apply Inspiration ----------------------------------------------------------
if (props.state === "on") {

    // Basic Bardic Inspiration -----------------------------------------------
    const effect = await getEffect({
        actorData:   props.actorData,
        effectLabel: "Bardic Inspiration"
    });

    if (effect) {
        const effectData = [
            {
                key:      "flags.midi-qol.optional.bardicInspiration.label",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    "Bardic Inspiration",
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.bardicInspiration.save.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.bardicInspiration.check.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.bardicInspiration.skill.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.bardicInspiration.attack.all",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `+${props.inspirationDice}`,
                priority: 20
            }
        ];

        // Handle modifications -----------------------------------------------
        await checkMagicalInspiration(props.casterData, effectData, props.inspirationDice);
        await checkMoteofPotential(props.casterData, effectData, props.inspirationDice);

        // Update Bardic Inspiration ------------------------------------------
        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
            _id: effect.id,
            changes: [
                ...effect.data.changes,
                ...effectData
            ]
        }]);

        applyAnimation();
    }
}


// Handle After Effects -------------------------------------------------------
if (props.state === "off") {
    removeAnimation();
}

if (props.state === "off" && props.lastArg["expiry-reason"] === "midi-qol:optionalConsumed") {

    // Mote of Potential ------------------------------------------------------
    await handleMoteofPotential();
}


/* ==========================================================================
    Magical Inspiration
   ========================================================================== */

/**
 * Handles applying effects of Magical Inspiration
 *
 * @param  {Actor5e}       actorData        Actor to be checked for data
 * @param  {ActiveEffect}  effectData       Effect data to be modified
 * @param  {string}        inspirationDice  Roll string for dice information
 */
async function checkMagicalInspiration (actorData, effectData, inspirationDice) {
    const ability = await getItems({
        actorData,
        itemLabel: "Magical Inspiration"
    });

    if (ability.length > 0) {
        effectData.push({
            key:      "flags.midi-qol.optional.bardicInspiration.damage.heal",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `+${inspirationDice}`,
            priority: 20
        });
        effectData.push({
            key:      "flags.midi-qol.optional.bardicInspiration.damage.msak",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `+${inspirationDice}`,
            priority: 20
        });
        effectData.push({
            key:      "flags.midi-qol.optional.bardicInspiration.damage.rsak",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `+${inspirationDice}`,
            priority: 20
        });
    }
}


/* ==========================================================================
    Mote of Potential
   ========================================================================== */

/**
 * Handles applying effects of Mote of Potential
 *
 * @param  {Actor5e}       actorData        Actor to be checked for data
 * @param  {ActiveEffect}  effectData       Effect data to be modified
 * @param  {string}        inspirationDice  Roll string for dice information
 */
async function checkMoteofPotential (actorData, effectData, inspirationDice) {
    const ability = await getItems({
        actorData,
        itemLabel: "Mote of Potential"
    });

    if (ability.length > 0) {
        effectData.forEach((change) => {
            if (change.key === "flags.midi-qol.optional.bardicInspiration.check.all" ||
                change.key === "flags.midi-qol.optional.bardicInspiration.skill.all") {
                change.value = `+2${inspirationDice.substring(1)}kh`;
            }
        });
    }
}

/**
 * Handles automating outcomes of the Mote of Potential
 */
async function handleMoteofPotential () {

    // Check for Mote ---------------------------------------------------------
    const mote = await getItems({
        actorData: props.casterData,
        itemLabel: "Mote of Potential"
    });

    if (!mote) {
        return false;
    }

    // Mote Workflow ----------------------------------------------------------
    new Dialog({
        title: "Mote of Potential",
        content: "<p>Which action did you take?</p>",
        buttons: {
            abilityCheck: {
                label: "Ability Check"
            },

            attack: {
                label: "Attack Roll",
                callback: async () => {
                    handleMoteAttack(props.tokenData);
                }
            },

            save: {
                label: "Saving Throw",
                callback: async () => {
                    handleWorkflow([props.tokenData], CONFIG.DND5E.healingTypes.temphp);
                }
            }
        }
    }).render(true);
}

/**
 * Handles workflow for Mote of Potentials attack
 *
 * @param  {Token5e}  target  Primary target of the character's attack
 */
async function handleMoteAttack (target) {

    // Get Targets ------------------------------------------------------------
    let [targets] = Array.from(game.user.targets);
    targets = MidiQOL.findNearby(CONST.TOKEN_DISPOSITIONS.HOSTILE, target, 5, null);

    if (targets.length > 0) {

        // Attempt to save ----------------------------------------------------
        const saveDC      = props.casterData.data.data.attributes.spelldc;
        const failedSaves = await targets.reduce(async (list, target) => {
            const save = await MidiQOL.socket().executeAsGM("rollAbility", {
                request:    "save",
                targetUuid: target.actor.uuid,
                ability:    "con"
            });

            if (save.total < saveDC) {
                list.push(target);
            }

            return list;
        }, []);

        // Apply Damage -------------------------------------------------------
        if (failedSaves.length > 0) {
            handleWorkflow(failedSaves, CONFIG.DND5E.damageTypes.thunder);
        }
    }
}

/**
 * Handles applying damage or healing to the specified targets via MidiQOL
 *
 * @param  {Array<Token5e>}  targets     Targets to be effected
 * @param  {string}          damageType  Damage type to be applied to the target
 */
async function handleWorkflow (targets, damageType) {

    new Dialog({
        title:   `Mote of Potential (${damageType})`,
        content: `
            <form class="flexcol">
                <div class="form-group">
                    <label for="dieNum">Bardic Inspiration Roll</label>
                    <input type="text" name="dieNum" placeholder="Enter value" />
                </div>
            </form>
        `,
        buttons: {
            apply: {
                icon:  "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const formula = html.find("[name=\"dieNum\"]").val();
                    const roll = await new Roll(formula).roll({ async: false });

                    if (damageType === CONFIG.DND5E.healingTypes.temphp) {
                        props.actorData.update({
                            "data.attributes.hp.temp":
                                Math.clamped(roll.total + props.casterData.data.data.abilities.cha.mod, 0, Infinity)
                        });
                    } else {
                        new MidiQOL.DamageOnlyWorkflow(
                            actor,
                            token,
                            roll.total,
                            damageType,
                            targets,
                            roll,
                            { flavor: `Mote of Potential (${damageType})` }
                        );
                    }
                }
            }
        }
    }).render(true);
}


/* ==========================================================================
    Animations
   ========================================================================== */

function applyAnimation () {
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file("jb2a.markers.music.blueyellow")
                .attachTo(props.tokenData)
                .persist()
                .scaleToObject(1.75)
                .name(props.animationID)
                .fadeIn(300)
                .fadeOut(300)
                .belowTokens()
            .play();
    }
}

function removeAnimation () {
    if (game.modules.get("sequencer")?.active) {
        Sequencer.EffectManager.endEffects({
            name:   props.animationID,
            object: props.tokenData
        });
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
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
