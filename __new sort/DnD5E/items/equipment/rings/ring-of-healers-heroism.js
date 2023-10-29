/* ==========================================================================
    Macro:         Ring of Healer's Heroism
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg.tokenId);

const props = {
    name: "Ring of Healer's Heroism",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData.actor || {},
    targets:   lastArg.targets || [],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.targets.length > 0) {
    const damageType = props.lastArg.damageDetail[0]?.type || "unknown";

    // Exit if we are not doing healing or only targeting self ----------------
    if (damageType !== CONFIG.DND5E.healingTypes.healing.toLowerCase() ||
        isTargetingSelf(props.actorData, props.targets)) {
        return false;
    }

    // Create effect information ----------------------------------------------
    const modifier = props.actorData.getRollData().attributes.spellcasting || "";
    const tempHP   = props.actorData.getRollData().abilities?.[modifier]?.mod || 0;

    const effectData = {
        changes: [
            {
                key:      "system.attributes.hp.temp",
                mode:     CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                value:    tempHP,
                prioirty: 20
            },
            {
                key:      "system.traits.ci.value",
                mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                value:    "frightened",
                prioirty: 20
            }
        ],
        origin:   props.lastArg.itemUuid,
        disabled: false,
        flags: {
            dae: {
                specialDuration: ["turnEndSource"]
            }
        },
        duration: {
            seconds:    12,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        },
        icon:  "worlds/assets/icons/items/equipment/rings/ring-of-healers-heroism.png",
        label: props.name
    };

    // Apply effect to self ---------------------------------------------------
    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: props.actorData.uuid,
        effects:   [effectData]
    });

    // Remove Frightened Condition --------------------------------------------
    const hasEffect = game.dfreds.effectInterface.hasEffectApplied("Frightened", props.actorData.uuid);

    if (hasEffect) {
        game.dfreds.effectInterface.removeEffect({
            effectName: "Frightened",
            uuid: props.actorData.uuid
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
 * Checks if the user is targeting themselves
 *
 * @param   {Actor5e}         actorData  Actor to be checked
 * @param   {Array[Actor5e]}  targets    Actor to be checked
 * @returns {boolean}                    Check if character is targeting self
 */
function isTargetingSelf (actorData, targets) {
    if (targets.length > 1) {
        return false;
    }

    return actorData?.name === targets?.[0]?.actor?.name;
}
