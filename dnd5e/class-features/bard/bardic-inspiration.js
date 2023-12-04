/* ==========================================================================
    Macro:         Bardic Inspiration
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};
const casterData = fromUuidSync(lastArg.efData.origin.substring(0, lastArg.efData.origin.indexOf("Item") - 1));

const props = {
    name: "Bardic Inspiration",
    state: args[0]?.tag || args[0] || "unknown",

    // Bardic Inspiration Target
    actorData: tokenData?.actor || {},
    tokenData,
    inspirationDice: casterData.getRollData().scale.bard["bardic-inspiration-dice"],
    itemData: lastArg.efData.flags.dae.itemData,

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
        actorData: props.actorData,
        effectLabel: "Bardic Inspiration"
    });

    if (effect && effect.changes.length === 1) {
        const effectData = [
            {
                key: "flags.midi-qol.optional.bardicInspiration.label",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: "Bardic Inspiration",
                priority: 20
            },
            {
                key: "flags.midi-qol.optional.bardicInspiration.save.all",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key: "flags.midi-qol.optional.bardicInspiration.check.all",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key: "flags.midi-qol.optional.bardicInspiration.skill.all",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: `+${props.inspirationDice}`,
                priority: 20
            },
            {
                key: "flags.midi-qol.optional.bardicInspiration.attack.all",
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: `+${props.inspirationDice}`,
                priority: 20
            }
        ];

    //     // Handle modifications -----------------------------------------------
    //     await checkMagicalInspiration(props.casterData, effectData, props.inspirationDice);

        // Update Bardic Inspiration ------------------------------------------
        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
            _id: effect.id,
            changes: [
                ...effect.changes,
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
            key: "flags.midi-qol.optional.bardicInspiration.damage.heal",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `+${inspirationDice}`,
            priority: 20
        });
        effectData.push({
            key: "flags.midi-qol.optional.bardicInspiration.damage.msak",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `+${inspirationDice}`,
            priority: 20
        });
        effectData.push({
            key: "flags.midi-qol.optional.bardicInspiration.damage.rsak",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `+${inspirationDice}`,
            priority: 20
        });
    }
}


/* ==========================================================================
    Animations
   ========================================================================== */

/**
 * Applies the animation to the target
 */
function applyAnimation () {
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file("jb2a.bardic_inspiration.blueyellow")
                .attachTo(props.tokenData)
                .fadeIn(250)
                .fadeOut(250)
                .waitUntilFinished()
            .effect()
                .file("jb2a.markers.music.blueyellow")
                .attachTo(props.tokenData)
                .persist()
                .scaleToObject(1.25)
                .name(props.animationID)
                .opacity(0.5)
                .fadeIn(300)
                .fadeOut(300)
                .belowTokens()
            .play();
    }
}

/**
 * Removes the animation from the target
 */
function removeAnimation () {
    if (game.modules.get("sequencer")?.active) {
        Sequencer.EffectManager.endEffects({
            name: props.animationID,
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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
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
