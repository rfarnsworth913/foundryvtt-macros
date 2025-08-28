/* ==========================================================================
    Macro:         Frostbitten Buckler
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Frostbitten Buckler",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    itemData: lastArg.itemData || {},

    workflow: lastArg.workflow || {},

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" && props.workflow) {
    const [{ damage }] = props.workflow.damageDetail;

    const tempHPEffect = {
        label: `${props.name} (Temp HP)`,
        icon: props.itemData.img,
        origin: props.itemData,
        disabled: false,
        changes: [
            {
                key: "system.attributes.hp.temp",
                value: damage,
                mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                priority: 20,
            }
        ],
        duration: {
            seconds: 60,
            startTime: game.time.worldTime,
            startRound: game.combat ? game.combat.round : 0
        }
    };

    await createEffects({
        actorData: props.actorData,
        effects: [tempHPEffect]
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
