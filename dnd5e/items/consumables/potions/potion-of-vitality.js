/* ==========================================================================
    Macro:         Potion of Vitality
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.targets[0].id) || {};

const props = {
    name: "Potion of Vitality",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    uuid:      tokenData.actor.uuid,

    conditions: [
        "Exhaustion 1",
        "Exhaustion 2",
        "Exhaustion 3",
        "Exhaustion 4",
        "Exhaustion 5",
        "Poisoned",
        "Diseased"
    ]
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("dfreds-convenient-effects")?.active)) {
    return ui.notifications.error("dfreds-convenient-effects is required!");
}

// Remove conditions ----------------------------------------------------------
props.conditions.forEach((condition) => {
    const hasEffect = game.dfreds.effectInterface.hasEffectApplied(condition, props.uuid);

    if (hasEffect) {
        game.dfreds.effectInterface.removeEffect({
            effectName: condition,
            uuid: props.uuid
        });
    }
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
