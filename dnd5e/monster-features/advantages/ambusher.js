/* ==========================================================================
    Macro:         Ambusher
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Ambusher",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.efData,
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (game.combat?.round === 1) {
    // Check for effect existing ----------------------------------------------
    const effect = getEffect({
        actorData: props.actorData,
        effectLabel: `${props.name} (Combat Start)`
    });

    if (effect) {
        return false;
    }

    // Create and apply effect ------------------------------------------------
    const effectData = {
        label: `${props.name} (Combat Start)`,
        img: props.itemData.img,
        origin: lastArg.uuid,
        disabled: false,
        changes: [{
            key: "flags.midi-qol.advantage.attack.all",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: "1",
            priority: 20
        }],
        duration: {
            turns: 1,
            seconds: 6,
            startRound: game.combat ? game.combat.round : 0,
            startTime: game.time.worldTime
        }
    };

    await createEffects({
        actorData: props.actorData,
        effects: [effectData]
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
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return actorData.effects.find(effect => effect.name.toLowerCase() === effectLabel.toLowerCase());
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
