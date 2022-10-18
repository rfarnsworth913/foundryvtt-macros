/* ==========================================================================
    Macro:         Sneak Attack
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Sneak Attack",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,
    tokenData,

    damageDice: tokenData.actor.getRollData()?.scale?.rogue?.["sneak-attack"] ?? "2d6",
    damageType: lastArg.damageDetail[0].type,

    animations: {
        source: "jb2a.sneak_attack.dark_purple"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Check for usage flag ---------------------------------------------------
    if (getProperty(props.actorData.flags, "midi-qol.SneakAttackUsed")) {
        return false;
    }

    if (!props.lastArg.advantage) {
        return false;
    }

    if (!props.itemData.system.actionType === "rwak" && !props.itemData.system.properties.fin) {
        return false;
    }

    // Ask to apply Sneak Attack ----------------------------------------------
    const dialogResult = await Dialog.confirm({
        title:       "Sneak Attack",
        content:     "<p>Apply Sneak Attack?</p>",
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
        origin:   props.uuid,
        disabled: false,
        duration: {
            turn: 1
        },
        label: `${props.name} already used this round`,
        icon:  "worlds/assets/icons/features/class/rogue/sneak-attack.png"
    };

    await createEffects({
        actorData: props.actorData,
        effects:   [effectData]
    });


    // Return bonus damage ----------------------------------------------------
    playAnimation();

    return {
        damageRoll: `${props.damageDice}[${props.damageType}]`,
        flavor:     props.name
    };
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
 * Plays the animation for the attack when called
 */
function playAnimation () {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file(props.animations.source)
                .attachTo(props.tokenData)
                .scaleToObject(1.75)
                .fadeIn(300)
                .fadeOut(300)
                .waitUntilFinished()
            .play();
    }
}
