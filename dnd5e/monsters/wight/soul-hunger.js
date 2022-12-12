/* ==========================================================================
    Macro:         Soul Hunger
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Soul Hunger",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animation: "jb2a.energy_strands.in.purple.01.2",
    damage:    lastArg.damageTotal,
    target:    canvas.tokens.get(lastArg.targets[0].id),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Validate target condition ----------------------------------------------
    const targetActor = props.target.actor;

    if (targetActor.system.attributes.hp.value - props.damage > 0) {
        return false;
    }

    // Apply healing to self --------------------------------------------------
    const roll = await new Roll("2d8").roll({ async: false });

    new MidiQOL.DamageOnlyWorkflow(
        actor,
        token,
        roll.total,
        "healing",
        [props.tokenData],
        roll,
        {
            flavor: "Soul Hunger - Damage Roll (Healing)"
        }
    );

    // Play animation ---------------------------------------------------------
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file(props.animation)
                .attachTo(props.tokenData)
                .scaleToObject(2)
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
