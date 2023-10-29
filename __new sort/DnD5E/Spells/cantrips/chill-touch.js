/* ==========================================================================
    Macro:         Chill Touch
    Source:        https://www.patreon.com/posts/chill-touch-53100896
    Usage:         On Use
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
    itemData:  lastArg.item,
    tokenData,

    targets: lastArg.hitTargets,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Validate Requirements ------------------------------------------------------
if (props.targets.length === 0) {
    return false;
}

// Process Targets ------------------------------------------------------------
const target = canvas.tokens.get(props.targets[0].id);
const undead = await filterTargets({
    targets: [target],
    creatureTypes: ["undead"]
});

// Create Effect --------------------------------------------------------------
const effectData = [{
    changes: [{
        key:      "system.traits.di.value",
        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
        value:    "healing",
        priority: 20
    }],
    label: `${props.name}`,
    icon:  props.itemData.img,
    origin: lastArg.uuid,
    disabled: false,
    flags: {
        dae: {
            itemData: props.itemData,
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

if (undead.length > 0) {
    effectData[0].changes.push({
        key:      "flags.midi-qol.disadvantage.attack.all",
        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
        value:    1,
        priority: 20
    });
}

await createEffects({
    actorData: target.actor,
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
 * Filters a target list by creature type
 *
 * @param    {object}          [options]
 * @param    {Array<Actor5e>}  targets        Targets list to be filtered
 * @param    {Array<string>}   creatureTypes  Creature types to filter by
 * @returns                                   Filtered list of targets
 */
async function filterTargets ({ targets = [], creatureTypes = [] }) {

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
                return target.actor.data.data.details.race.toLowerCase().includes(creatureType);
            }) :
            creatureTypes.some((creatureType) => {
                return target.actor.data.data.details.type.value.toLowerCase().includes(creatureType);
            });

        if (validTarget) {
            targetsList.push(target);
        }

        return targetsList;
    }, []);
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
