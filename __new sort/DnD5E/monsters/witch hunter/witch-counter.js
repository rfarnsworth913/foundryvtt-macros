/* ==========================================================================
    Macro:         Witch Counter
    Source:        Custom
    Usage:         DAE DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Witch Counter",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    itemData: lastArg.itemData,
    saveDC:   lastArg.damageTotal,
    target:   canvas.tokens.get(lastArg.hitTargets[0].id),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Concentration effect ---------------------------------------------------
    const effectData = {
        changes: [{
            key:      "flags.midi-qol.disadvantage.concentration",
            mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
            value:    1,
            priority: 20
        }],
        origin: props.itemData,
        disabled: false,
        duration: {
            seconds:    1,
            turns:      1,
            startTime:  game.time.worldTime,
            startRound: game.combat ? game.combat.rounds : 0
        },
        flags: {
            dae: {
                specialDuration: ["isSave.con"]
            }
        },
        icon:  "worlds/assets/icons/features/feats/defensive-duelist.png",
        label: "Witch Counter"
    };


    // Modify Concentration Roll ----------------------------------------------
    if (props.damage > 10) {
        const modifier = Math.floor(props.damage / 2);

        effectData.changes.push({
            key:      "data.bonuses.abilities.save",
            mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
            value:    `-${modifier}`,
            priority: 20
        });
    }

    // Apply effect to target -------------------------------------------------
    await props.target?.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
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
