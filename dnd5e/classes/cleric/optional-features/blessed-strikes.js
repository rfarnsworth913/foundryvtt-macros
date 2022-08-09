/* ==========================================================================
    Macro:         Blessed Strikes
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blessed Strikes",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    hitTargets: lastArg.hitTargets,
    spellLevel: lastArg.spellLevel || 0,
    uuid:       lastArg.uuid,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Check if Blessed Strikes already used
    if (getProperty(props.actorData.data.flags, "midi-qol.BlessedStrikesUsed")) {
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

    // Ask to apply Blessed Strikes
    let useBlessedStrikes = false;
    const dialog = new Promise((resolve) => {
        new Dialog({
            title: "Blessed Strikes",
            content: "Apply Blessed Strikes?",
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
            key:      "flags.midi-qol.BlessedStrikesUsed",
            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value:    "1",
            priority: 20
        }],
        origin: props.uuid,
        disabled: false,
        duration: {
            seconds: 1
        },
        label: "Blessed Strikes already used this round"
    };

    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

    playAnimation(props.tokenData, props.hitTargets[0]);

    // Return bonus damage
    return {
        damageRoll: `1d8[${CONFIG.DND5E.damageTypes.radiant}]`,
        flavor:     "Blessed Strikes"
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}


function playAnimation (source, target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.divine_smite.caster.blueyellow")
                .attachTo(source)
                .scaleToObject(1.75)
                .fadeIn(300)
                .fadeOut(300)
                .waitUntilFinished()
            .effect()
                .file("jb2a.divine_smite.target.blueyellow")
                .attachTo(target)
                .scaleToObject(1.75)
            .play();
    }
}
