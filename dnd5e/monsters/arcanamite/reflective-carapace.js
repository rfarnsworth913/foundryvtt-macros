/* ==========================================================================
    Macro:         Reflective Carapace
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Reflective Carapace",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "OnUse") {

    // Get damage workflow ----------------------------------------------------
    const messageHistory = Object.values(MidiQOL.Workflow.workflows).filter((workflow) => {
        let targeted = false;

        workflow.hitTargets.forEach((target) => {
            if (target.id === props.tokenData.id) {
                targeted = true;
            }
        });

        return workflow.workflowType === "Workflow" && targeted;
    });

    if (messageHistory.length === 0) {
        return false;
    }

    const roll = await new Roll("1d6").roll({ async: true });
    game?.dice3d.showForRoll(roll);

    // Handle Self-Healing ----------------------------------------------------
    const [{ damageRoll }] = messageHistory;
    const healRoll = await new Roll(`${damageRoll.total}`).roll({ async: true });

    new MidiQOL.DamageOnlyWorkflow(
        actor,
        token,
        healRoll.total,
        CONFIG.DND5E.healingTypes.healing,
        [props.tokenData],
        healRoll,
        {
            flavor:     "Reflective Carapace (Healing)",
            itemCardId: "new"
        }
    );

    // Check for Reflection ---------------------------------------------------
    if (roll.total === 6) {
        const target = canvas.tokens.get(messageHistory[0].token.id);

        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            damageRoll.total,
            messageHistory[0].damageDetail[0].type,
            [target],
            damageRoll,
            {
                flavor:     "Reflective Carapace (Attack)",
                itemCardId: "new"
            }
        );
    }

    // Remove Reaction Tracker ------------------------------------------------
    await removeEffect({
        actorData:   props.actorData,
        effectLabel: "Reaction"
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
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
