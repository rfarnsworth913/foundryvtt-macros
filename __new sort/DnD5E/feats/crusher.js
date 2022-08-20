/* ==========================================================================
    Macro:         Crusher
    Source:        Custom
    Usage:         DamageBonusMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Crusher",
    state: args[0]?.tag || args[0] || "unknown",

    damageType: lastArg.item.data.damage.parts[0][1] ?? "unknown",
    icon:       "icons/skills/melee/strike-flail-spiked-pink.webp",
    isCritical: lastArg?.isCritical || false,
    itemUUID:   lastArg.itemUuid || "",
    target:     lastArg.targets[0]
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.isCritical && props.damageType === "bludgeoning") {
    const gameRound = game.combat ? game.combat.round : 0;
    const effectData = {
        changes: [{
            key:      "flags.midi-qol.grants.advantage.attack.all",
            mode:     2,
            priority: 20,
            value:    1
        }],
        origin: props.itemUUID,
        disabled: false,
        duration: {
            rounds:     1,
            turns:      1,
            seconds:    12,
            startRound: gameRound,
            startTime:  game.time.worldTime
        },
        flags: {
            dae: {
                specialDuration: ["turnStartSource"]
            }
        },
        icon:  props.icon,
        label: props.name
    };

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
