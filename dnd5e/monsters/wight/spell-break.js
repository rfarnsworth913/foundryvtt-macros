/* ==========================================================================
    Macro:         Spell Break
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spell Break",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    target: canvas.tokens.get(lastArg.hitTargets[0].id),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Check for effect -------------------------------------------------------
    const effect = await hasEffect({
        actorData:   props.target.actor,
        effectLabel: props.name
    });

    if (effect) {
        return false;
    }

    // Apply effect to target -------------------------------------------------
    const effectData = {
        label:    props.name,
        icon:     "worlds/assets/icons/features/monsters/spell-break.png",
        origin:   props.lastArg.uuid,
        disalbed: false,
        changes: [{
            key:      "flags.midi-qol.disadvantage.concentration",
            mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
            priority: 20,
            value:    1
        }],
        flags: {
            dae: {
                specialDuration: ["turnEnd"]
            }
        },
        duration: {
            seconds:    12,
            rounds:     1,
            turns:      1,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        }
    };

    await createEffects({
        actorData: props.target.actor,
        effects:   [effectData]
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

/**
 * Checks if a specified actor has the expected effect applied to their character
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<Boolean>}       Status of the effect on target
 */
async function hasEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return Boolean(actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}
