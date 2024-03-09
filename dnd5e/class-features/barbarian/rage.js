/* ==========================================================================
    Macro:         Rage
    Source:        Custom
    Usage:         DAE Hooks Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Rage",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Handle setup of Hooks ------------------------------------------------------
if (props.state === "on") {
    const hooks = [];

    // Set Initial Rage State -------------------------------------------------
    DAE.setFlag(props.actorData, "barbarianRageState", true);

    // Handle Unconscious Condition -------------------------------------------
    const unconsciousHook = Hooks.on("applyActiveEffect", async (actor) => {
        if (actor.uuid === props.actorData.uuid) {
            const effect = await getEffect({ actorData: actor, effectLabel: "Unconscious" });
            if (effect) {
                await removeEffect({ actorData: actor, effectLabel: "Rage" });
            }
        }
    });
    hooks.push({ type: "applyActiveEffect", id:   unconsciousHook });

    // Handle Attack Condition ------------------------------------------------
    const attackHook = Hooks.on("dnd5e.preRollAttack", async () => {
        DAE.setFlag(props.actorData, "barbarianRageState", true);
    });
    hooks.push({ type: "dnd5e.preRollAttack", id: attackHook });

    // Handle Damage Condition ------------------------------------------------
    const damageHook = Hooks.on("dnd5e.applyDamage", async (actor) => {
        if (actor.uuid === props.actorData.uuid) {
            DAE.setFlag(props.actorData, "barbarianRageState", true);
        }
    });
    hooks.push({ type: "dnd5e.applyDamage", id: damageHook });

    DAE.setFlag(props.actorData, "barbarianRage", hooks);
}

// Handle checking conditons --------------------------------------------------
if (props.state === "each") {
    const continueRage = DAE.getFlag(props.actorData, "barbarianRageState");

    if (!continueRage) {
        await removeEffect({
            actorData: props.actorData,
            effectLabel: "Rage"
        });
    } else {
        DAE.unsetFlag(props.actorData, "barbarianRageState");
    }
}

// Handle remvoing Hooks ------------------------------------------------------
if (props.state === "off") {
    const hooks = DAE.getFlag(props.actorData, "barbarianRage");
    DAE.unsetFlag(props.actorData, "barbarianRage");
    DAE.unsetFlag(props.actorData, "barbarianRageState");

    if (hooks) {
        hooks.forEach((hook) => {
            Hooks.off(hook.type, hook.id);
        });
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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    }));
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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
