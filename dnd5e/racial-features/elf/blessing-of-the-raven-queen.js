/* ==========================================================================
    Macro:         Blessing of the Raven Queen
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blessing of the Raven Queen",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    characterLevel: tokenData?.actor?.system?.details?.level,
    itemData: lastArg?.item || {},

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.characterLevel < 3) {
    return console.error("Character level is too low to use this feature.");
}

const effectData = [{
    changes: [{
        key: "system.traits.dr.all",
        mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value: 1,
        priority: 20
    }],
    label: props.name,
    icon: props.itemData.img,
    origin: props.itemData.uuid,
    disabled: false,
    flags: {
        dae: {
            specialDuration: ["turnEnd"]
        }
    },
    duration: {
        seconds: 6,
        startRound: game.combat ? game.combat.round : 0,
        startTime: game.time.worldTime
    }
}];

await createEffects({ actorData: props.actorData, effects: effectData });


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
