/* ==========================================================================
    Macro:         Divine Strike
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Divine Strike",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    casterLevel: tokenData.actor.getRollData().classes.cleric.levels || 0,
    hitTargets:  lastArg.hitTargets,
    spellLevel:  lastArg.spellLevel || 0,
    uuid:        lastArg.uuid,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Check if Divine Strike already used
    if (getProperty(props.actorData.data.flags, "midi-qol.DivineStrikeUsed")) {
        return false;
    }

    // Check if spell level greater than 1
    if (props.spellLevel > 0) {
        return false;
    }

    // Check target disposition
    if (props.hitTargets[0].data.disposition !== CONST.TOKEN_DISPOSITIONS.HOSTILE) {
        return false;
    }

    // Ask to apply Divine Strike
    let useBlessedStrikes = false;
    const dialog = new Promise((resolve) => {
        new Dialog({
            title: "Divine Strike",
            content: "Apply Divine Strike?",
            buttons: {
                ok: {
                    icon: "<i class=\"fas fa-check\"></i>",
                    label: "Apply",
                    callback: () => {
                        resolve(true);
                    }
                },

                cancel: {
                    icon: "<i class=\"fas fa-times\"></i>",
                    label: "Cancel",
                    callback: () => {
                        resolve(false);
                    }
                }
            }
        }).render(true);
    });

    useBlessedStrikes = await dialog;

    if (!useBlessedStrikes) {
        return {};
    }

    // Create tracking effect data
    const effectData = {
        changes: [{
            key:      "flags.midi-qol.DivineStrikeUsed",
            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value:    "1",
            priority: 20
        }],
        origin: props.uuid,
        disabled: false,
        duration: {
            seconds: 1
        },
        label: "Divine Strike already used this round"
    };

    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

    playAnimation(props.tokenData, props.hitTargets[0]);

    const dice = props.casterLevel >= 14 ? 2 : 1;

    // Return bonus damage
    return {
        damageRoll: `${dice}d8[${CONFIG.DND5E.damageTypes.fire}]`,
        flavor:     "Divine Strike"
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
 * Plays animation on target
 *
 * @param  {Token5e}  source  Token to use in animation
 * @param  {Token5e}  target  Token to use in animation
 */
function playAnimation (source, target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.divine_smite.caster.orange")
                .attachTo(source)
                .scaleToObject(1.75)
                .fadeIn(300)
                .fadeOut(300)
                .waitUntilFinished()
            .effect()
                .file("jb2a.divine_smite.target.orange")
                .attachTo(target)
                .scaleToObject(1.75)
            .play();
    }
}
