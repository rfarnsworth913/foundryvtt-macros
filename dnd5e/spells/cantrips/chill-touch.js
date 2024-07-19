/* ==========================================================================
    Macro:         Chill Touch
    Source:        Custom
    Usage:         OnUse ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Chill Touch",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.itemData,
    tokenData,

    targetData: lastArg?.hitTargets[0] || {},

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Create and apply effect ----------------------------------------------------
const effectData = [{
    changes: [{
        key:      "system.traits.di.value",
        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
        value:    "healing",
        priority: 20
    }],
    label:    `${props.name}`,
    icon:     props.itemData.img,
    origin:   lastArg.uuid,
    disabled: false,
    flags: {
        dae: {
            itemData:        props.itemData,
            specialDuration: ["turnStartSource"]
        }
    },
    duration: {
        rounds:     1,
        seconds:    12,
        startRound: game.combat ? game.combat.round : 0,
        startTime:  game.time.worldTime
    }
}];

const targetRollData = props.targetData.actor.getRollData();

if (targetRollData.details.type.value.toLowerCase() === "undead") {
    effectData[0].changes.push({
        key:      "flags.midi-qol.disadvantage.attack.all",
        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
        value:    1,
        priority: 20
    });
}

await createEffects({
    actorData: props.targetData.actor,
    effects:   effectData
});

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
