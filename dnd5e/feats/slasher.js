/* ==========================================================================
    Macro:         Slasher
    Source:        Custom
    Usage:         Damage BOnus
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Slasher",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,
    tokenData,

    damageType: lastArg.item.system.damage.parts[0][1] ?? "unknown",
    isCritical: lastArg?.isCritical || false,
    target:     canvas.tokens.get(lastArg.targets[0].id),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Attack Modifiers -----------------------------------------------------------
if (props.state === "DamageBonus" && props.isCritical && props.damageType === "slashing") {
    const effectData = {
        changes: [{
            key:      "flags.midi-qol.disadvantage.attack.all",
            mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
            value:    "1",
            priority: 20
        }],
        origin:   props.itemData.uuid,
        disabled: false,
        flags: {
            dae: {
                specialDuration: "turnStartSource"
            }
        },
        duration: {
            rounds:     1,
            turns:      1,
            seconds:    12,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        },
        label: "Grievous Wound",
        icon:  "icons/skills/melee/strike-sword-steel-yellow.webp"
    };

    await createEffects({
        actorData: props.target.actor,
        effects:   [effectData]
    });
}

// Speed Reduction Handling ---------------------------------------------------
if (props.state === "DamageBonus" && props.damageType === "slashing") {

    // Check for usage flag ---------------------------------------------------
    if (getProperty(props.actorData.flags, "midi-qol.SlasherUsed")) {
        return false;
    }

    // Ask to apply Slasher Speed Reduction -----------------------------------
    const dialogResult = await Dialog.confirm({
        title:       "Slasher",
        content:     "<p>Apply Slasher speed reduction?",
        rejectClose: true
    });

    if (!dialogResult) {
        return false;
    }

    // Create tracking effect -------------------------------------------------
    const effectData = {
        changes: [{
            key:      `flags.midi-qol.${props.name.replace(" ", "")}Used`,
            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value:    "1",
            priority: 20
        }],
        origin:   props.itemData.uuid,
        disabled: false,
        duration: {
            seconds:   1,
            startTime: game.time.worldTime
        },
        label: `${props.name} already used this round`,
        icon:  "icons/skills/melee/strike-sword-steel-yellow.webp"
    };

    await createEffects({
        actorData: props.actorData,
        effects:   [effectData]
    });

    // Apply Speed Reduction --------------------------------------------------
    const speedDebuff = {
        changes: [{
            key:      "system.attributes.movement.all",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    "-10",
            priority: 20
        }],
        origin:   props.itemData.uuid,
        disabled: false,
        flags: {
            dae: {
                specialDuration: "turnStartSource"
            }
        },
        duration: {
            rounds:     1,
            turns:      1,
            seconds:    12,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        },
        label: "Slasher Movement",
        icon:  "icons/skills/melee/strike-sword-steel-yellow.webp"
    };

    await createEffects({
        actorData: props.target.actor,
        effects:   [speedDebuff]
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
