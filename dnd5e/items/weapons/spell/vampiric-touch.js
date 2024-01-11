/* ==========================================================================
    Macro:         Vampiric Touch
    Source:        Custom
    Usage:         ItemUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name:      "Vampiric Touch",
    macroPass: lastArg.macroPass || "unknown",
    state:     args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    target:    lastArg.hitTargets[0] || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for dependencies -----------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}


if (props.state === "OnUse" && props.macroPass === "preDamageApplication") {

    // Get damage workflow ----------------------------------------------------
    const messageHistory = Object.values(MidiQOL.Workflow.workflows).filter((workflow) => {
        return workflow.workflowType === "Workflow" &&
               workflow.damageTotal > 0 &&
               workflow.hitTargets.filter((target) => {
                   return target.name === props.target?.name;
               });
    });

    // Apply Healing to Self --------------------------------------------------
    if (messageHistory) {
        const lastAttack = messageHistory[messageHistory.length - 1];
        const damage = lastAttack.damageList[0].appliedDamage;

        const currentHP = Number(props.actorData.system.attributes.hp.value);
        const maxHP = Number(props.actorData.system.attributes.hp.max);
        const healing = Math.floor(Math.clamped(currentHP + (damage / 2), 0, maxHP));

        const updates = {
            actor: {
                ["system.attributes.hp.value"]: healing
            }
        };
        await warpgate.mutate(props.tokenData.document, updates, {}, { permanent: true });
    }

    // Animation for healing --------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .attachTo(props.tokenData)
                .file("jb2a.healing_generic.200px.purple")
                .fadeIn(300)
                .fadeOut(300)
            .play();
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
