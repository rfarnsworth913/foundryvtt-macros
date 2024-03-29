/* ==========================================================================
    Macro:         Relentless Endurance
    Source:        https://www.patreon.com/posts/relentless-86301534
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Relentless Endurance",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: await fromUuidSync(lastArg.actorUuid) || {},
    itemData:  await fromUuidSync(lastArg.efData.origin),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Effect data ----------------------------------------------------------------
const lifeCheck = {
    origin: props.lastArg.origin,
    changes: [
        {
            key:      "macro.itemMacro",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `ItemMacro.${props.itemData.name}`,
            priority: 20
        }
    ],
    flags: {
        dae: {
            specialDuration: ["zeroHP"],
            transfer:        false
        }
    },
    disabled: false,
    transfer: false,
    name: `${props.itemData.name} Life Check`,
    icon: props.itemData.img
};
const sleepCheck = {
    origin: props.lastArg.origin,
    changes: [
        {
            key: "macro.itemMacro",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: `ItemMacro.${props.itemData.name}`,
            priority: 20
        }
    ],
    flags: {
        dae: {
            specialDuration: ["longRest"],
            transfer: false
        }
    },
    disabled: false,
    transfer: false,
    name: `${props.itemData.name} Sleep Check`,
    icon: props.itemData.img
};


// Apply effects with expiration reason ---------------------------------------
if (props.state === "on") {
    const effectData = [];

    if (!await getEffect({ actorData: props.actorData, effectLabel: `${props.itemData.name} Life Check` })) {
        effectData.push(lifeCheck);
    }

    if (!await getEffect({ actorData: props.actorData, effectLabel: `${props.itemData.name} Sleep Check` })) {
        effectData.push(sleepCheck);
    }

    if (effectData.length > 0) {
        await createEffects({ actorData: props.actorData, effects: effectData });
    }
}

// Remove effects without expiration reason -----------------------------------
if (props.state === "off" &&
    !props.lastArg["expiry-reason"]?.includes("zeroHP") &&
    !props.lastArg["expiry-reason"]?.includes("rest")) {
    await removeEffect({ actorData: props.actorData, effectLabel: `${props.itemData.name} Life Check` });
    await removeEffect({ actorData: props.actorData, effectLabel: `${props.itemData.name} Sleep Check` });
}

// Zero HP Handling -----------------------------------------------------------
if (props.lastArg["expiry-reason"]?.includes("zeroHP")) {

    // Handle no charges left -------------------------------------------------
    if (props.itemData.system.uses.value === 0) {
        return console.warn("Item has no uses left to trigger Relentless Endurance");
    }

    // Handle charges left ----------------------------------------------------
    const workflow = await Object.values(MidiQOL.Workflow.workflows).filter((workflow) => {
        return Array.from(workflow.hitTargets).filter((target) => {
            return [props.actorData.id].includes(target.actor.id);
        });
    }).pop();

    await wait(700);

    const damageList = workflow.damageList.filter((damage) => {
        return damage.actorId === props.actorData.id;
    });
    const maxDamage = Number(damageList[0].hpDamage) >= Math.floor(Number(props.actorData.system.attributes.hp.max) / 2)
        ? true : false;

    if (maxDamage) {
        // eslint-disable-next-line max-len
        console.warn(props.itemData.name, `Damage Exceeded ${Math.floor(Number(props.actorData.system.attributes.hp.max) / 2)}. Skipping`);
    }

    await actor.update({ "system.attributes.hp.value": 1 });
    await props.itemData.update({ "system.uses.value": 0 });
}

// Rest Handling --------------------------------------------------------------
if (props.lastArg["expiry-reason"]?.includes("rest")) {
    return await createEffects({
        actorData: props.actorData,
        effects: [lifeCheck, sleepCheck]
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
 * Creates an effect on a selected actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  effects  Effects to be applied to target
 * @returns  {Promise<Function>}       Deletion status of effect
 */
async function createEffects ({ actorData, effects = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effects || effects.length === 0) {
        return console.error("No effects specified");
    }

    return await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actorData.uuid,
        effects
    });
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
