/* ==========================================================================
    Macro:         Keeper of Souls
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Keeper of Souls",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);

// target.actor.getRollData().actorType === "npc" || "pc?"


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for dependencies -----------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}


if (props.state === "OnUse") {

    // Get death workflow -----------------------------------------------------
    const messageHistory = Object.values(MidiQOL.Workflow.workflows).filter((workflow) => {
        let deadTargets = false;

        workflow.hitTargets.forEach((target) => {
            if (target.actor.system.attributes.hp.value === 0) {
                deadTargets = true;
            }
        });

        return workflow.workflowType === "Workflow" &&
            deadTargets;
    });


    // Apply Healing to target ------------------------------------------------
    if (messageHistory) {
        let healingHitDice = 0;

        messageHistory[0].hitTargets.forEach((target) => {
            const targetData = target.actor.getRollData();

            if (targetData.attributes.hp.value > 0) {
                return false;
            }

            const creatureType = targetData.actorType;
            const hitDice = creatureType === "npc" ?
                target.actor.system.attributes.hp.formula.match(/^[0-9]*/)[0] :
                target.actor.system.attributes.hd;

            if (healingHitDice < hitDice) {
                healingHitDice = hitDice;
            }
        });

        const currentHP = Number(props.actorData.system.attributes.hp.value);
        const maxHP = Number(props.actorData.system.attributes.hp.max);
        const healing = Math.clamped(currentHP + Number(healingHitDice), 0, maxHP);

        const updates = {
            actor: {
                ["system.attributes.hp.value"]: healing
            }
        };
        await warpgate.mutate(props.tokenData.document, updates, {}, { permanent: true });
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
