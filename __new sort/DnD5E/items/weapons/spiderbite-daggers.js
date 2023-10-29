/* ==========================================================================
    Macro:         Spiderbite Daggers
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Spiderbite Daggers",
    state: args[0]?.tag || args[0] || "unknown",

    target: canvas.tokens.get(lastArg.targets[0].id),
    saveDC: 14,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Check for applied effect and stack count -------------------------------
    const effect = await getEffect({
        actorData: props.target.actor,
        effectLabel: "Spiderbite Daggers"
    });

    if (!effect || effect.flags.dae.stacks !== 2) {
        return false;
    }

    // Request Save -----------------------------------------------------------
    const save = await MidiQOL.socket().executeAsGM("rollAbility", {
        request:    "save",
        targetUuid: props.target.actor.uuid,
        ability:    "con",
        options: {
            advantage:   false,
            chatMessage: true,
            fastFoward:  false
        }
    });


    // Apply poisoned effect and damage ---------------------------------------
    if (props.saveDC > save.total) {
        const effectData = game.dfreds.effectInterface.findEffectByName("Poisoned").convertToObject();

        console.warn("Effect Data: ", effectData);

        effectData.flags.dae.specialDuration = ["turnEnd"];
        effectData.seconds = 12;

        game.dfreds.effectInterface.addEffectWith({ effectData, uuid: props.target.actor.uuid });

        const damageRoll = await new Roll("2d4").roll({ async: true });

        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            damageRoll.total,
            "poison",
            [props.target],
            damageRoll,
            {
                flavor:     `${props.name} - Damage Roll (Poison)`,
                itemCardId: props.lastArg.itemCardId
            }
        );
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

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.label.toLowerCase().includes(effectLabel.toLowerCase());
    }));
}
