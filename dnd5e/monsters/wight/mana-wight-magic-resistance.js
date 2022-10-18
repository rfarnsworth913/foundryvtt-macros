/* ==========================================================================
    Macro:         Magic Resistance
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Magic Resistance",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    animation: "jb2a.energy_strands.in.purple.01.2",
    workflow: lastArg.workflowOptions,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    await wait(1000);

    // Heal self --------------------------------------------------------------
    const damage = (props.workflow.damageTotal * 2).toString();
    const roll = await new Roll(damage).roll({ async: false });

    await MidiQOL.applyTokenDamage([{
        damage: roll.total,
        type:   "healing"
    }],
    roll.total,
    new Set([props.tokenData]),
    props.lastArg.itemData,
    new Set());

    // new MidiQOL.DamageOnlyWorkflow(
    //     actor,
    //     token,
    //     roll.total,
    //     "healing",
    //     [props.tokenData],
    //     roll,
    //     {
    //         flavor: "Magic Resistance (Healing)"
    //     }
    // );

    // Remove Reaction Tracker ------------------------------------------------
    await removeEffect({
        actorData: props.actorData,
        effectLabel: "Reaction"
    });

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

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}
