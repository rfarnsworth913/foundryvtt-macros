/* ==========================================================================
    Macro:         Rage
    Source:        Custom
    Usage:         DAE Hooks Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Rage",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: await fromUuidSync(lastArg.actorUuid) || {},
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    secondaryEffects: {
        optional: [
            "Frenzy",
            "Totem Spirit: Elk"
        ],
        passive: [
            "Mindless Rage",
            "Totem Spirit: Bear",
            "Totem Spirit: Eagle",
            "Totem Spirit: Tiger",
            "Totem Spirit: Wolf",
            "Totemic Attunement: Bear",
            "Totemic Attunement: Eagle"
        ],
    },

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Handle setup of Hooks ------------------------------------------------------
if (props.state === "on") {
    const persistentRage = await getItems({
        actorData: props.actorData,
        itemLabel: "Persistent Rage"
    });
    const hooks = [];

    // Set Initial Rage State -------------------------------------------------
    DAE.setFlag(props.actorData, "barbarianRageState", true);

    // Handle Unconscious Condition -------------------------------------------
    const unconsciousHook = Hooks.on("preCreateActiveEffect", async (effect) => {
        if (actor.uuid === props.actorData.uuid && effect.name === "Unconscious") {
            await removeEffect({ actorData: props.actorData, effectLabel: "Rage" });
        }
    });
    hooks.push({ type: "preCreateActiveEffect", id: unconsciousHook });

    // Only if Persistent Rage does not exist ---------------------------------
    if (persistentRage.length === 0) {
        // Handle Attack Condition --------------------------------------------
        const attackHook = Hooks.on("dnd5e.preRollAttackV2", () => {
            DAE.setFlag(props.actorData, "barbarianRageState", true);
        });
        hooks.push({ type: "dnd5e.preRollAttackV2", id: attackHook });

        // Handle Damage Condition --------------------------------------------
        const damageHook = Hooks.on("dnd5e.applyDamage", (actor) => {
            if (actor.uuid === props.actorData.uuid) {
                DAE.setFlag(props.actorData, "barbarianRageState", true);
            }
        });
        hooks.push({ type: "dnd5e.applyDamage", id: damageHook });
    }

    DAE.setFlag(props.actorData, "barbarianRage", hooks);

    activateSecondaryEffects();
}

// Handle checking conditons --------------------------------------------------
if (props.state === "each") {
    const continueRage = DAE.getFlag(props.actorData, "barbarianRageState");
    const persistentRage = await getItems({
        actorData: props.actorData,
        itemLabel: "Persistent Rage"
    });

    if (!continueRage && !persistentRage.length > 0) {
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

    // Remove related rage effects --------------------------------------------
    removeSecondaryEffects();
}


/* ==========================================================================
    Rage Supporting Features
   ========================================================================== */

function activateSecondaryEffects () {

    // Optional Effects -------------------------------------------------------
    props.secondaryEffects.optional.forEach(async (effect) => {
        const [effectItem] = await getItems({
            actorData: props.actorData,
            itemLabel: effect
        });

        if (!effectItem) {
            return;
        }

        return await new Promise((resolve) => {
            new Dialog({
                title: `${effectItem.name}`,
                content: `<p>Do you want to activate ${effectItem.name}</p>`,
                buttons: {
                    yes: {
                        label: effectItem.name,
                        callback: async () => {
                            return resolve(await effectItem.use({ legacy: false }));
                        }
                    },
                    no: {
                        label: "Cancel",
                        callback: () => {
                            return resolve(false);
                        }
                    }
                },
                default: "No"
            }).render(true);
        });
    });

    // Non-Optional Effects ---------------------------------------------------
    props.secondaryEffects.passive.forEach(async (effect) => {
        const [effectItem] = await getItems({
            actorData: props.actorData,
            itemLabel: effect
        });

        if (!effectItem) {
            return;
        }

        return await effectItem.use({ legacy: false });
    });
}

/**
 * Removes secondary effects of the Rage feature such as Frenzy
 */
function removeSecondaryEffects () {
    const effects = [
        ...props.secondaryEffects.optional,
        ...props.secondaryEffects.passive
    ];

    effects.forEach(async (effect) => {
        await removeEffect({
            actorData: props.actorData,
            effectLabel: effect
        });
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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects: [effect.id]
    });
}

/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
}
