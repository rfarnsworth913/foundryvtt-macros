/* ==========================================================================
    Macro:         Crypt Keeper Glaive
    Source:        Custom
    Usage:         DAE OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Crypt Keeper Glaive",
    state: args[0]?.tag || args[0] || "unknown",
    macroPass: lastArg.macroPass || "unknown",

    actorData: lastArg.actor || {},
    itemData: lastArg.itemData || {},
    targetData: lastArg.targets[0] || {},
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" && props.macroPass === "postActiveEffects" &&
    props.targetData.actor.system.attributes.hp.value <= 0) {

    // Apply temporary HP if the target is defeated
    const tempHP = await new CONFIG.Dice.DamageRoll("1d10", {}, { type: "temphp" }).evaluate();
    // props.actorData.update({ "system.attributes.hp.temp": tempHP.total });

    const tempHPEffect = {
        name: `${props.name} (Temp HP)`,
        icon: props.itemData.img,
        origin: props.itemData,
        disabled: false,
        changes: [
            {
                key: "system.attributes.hp.temp",
                value: tempHP.total,
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

    // Apply weapon effect
    const hazeEffect = {
        name: `${props.name} (Damage Haze)`,
        icon: props.itemData.img,
        origin: props.itemData,
        disabled: false,
        changes: [
            {
                key: "system.bonuses.mwak.damage",
                value: `${tempHP.total}[necrotic]`,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                priority: 20,
            },
            {
                key: "ATL.light.dim",
                value: 5,
                mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                priority: 20,
            },
            {
                key: "ATL.light.animation",
                value: "{ type: 'ghost' }",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20,
            },
            {
                key: "ATL.light.color",
                value: "#5F8575",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20,
            },
            {
                key: "ATL.light.alpha",
                value: 0.25,
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                priority: 20,
            },
        ],
        duration: {
            seconds: 60,
            startTime: game.time.worldTime,
            startRound: game.combat ? game.combat.round : 0
        },
        flags: {
            dae: {
                specialDuration: ["DamageDealt"]
            }
        }
    };
    await createEffects({
        actorData: props.actorData,
        effects: [tempHPEffect, hazeEffect]
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
