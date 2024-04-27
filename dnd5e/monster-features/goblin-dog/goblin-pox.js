/* ==========================================================================
    Macro:         Goblin Pox
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Goblin Pox",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    saveDC: 11,
    targets: lastArg.hitTargets,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Get list of effected targets -------------------------------------------
    const targets = await props.targets.reduce(async (acc, target) => {
        const targetActor = target.actor;
        const poisoned    = await getEffect({ actorData: targetActor, effectLabel: "Goblin Pox" });
        const immunity    = await getEffect({ actorData: targetActor, effectLabel: "Goblin Pox (Immunity)" });

        if ((targetActor.system.details.type.subtype.toLowerCase() !== "goblin" ||
            targetActor.name.toLowerCase() !== "goblin dog") && !immunity && !poisoned) {
            acc.push(target);
        }

        return acc;
    }, []);

    if (targets.length === 0) {
        return console.warn("No valid targets found!");
    }

    // Handle saving throw ----------------------------------------------------
    await game.MonksTokenBar.requestRoll(targets, {
        request:  "save:con",
        dc:       props.saveDC,
        flavor:   props.name,
        showdc:   false,
        silent:   true,
        continue: "always",
        rollMode: "request",
        callback: async (rollStatus) => {
            if (rollStatus.passed> 0) {
                await setImmunity(targets[0].actor);
            } else {
                await setGoblinPox(targets[0].actor);
            }
        }
    });
}

/**
 * Sets the immunity effect on the target actor
 * @param {Actor5e} targetActor Target actor to update
 */
async function setImmunity (targetActor) {
    const effectData = {
        label:    "Goblin Pox (Immunity)",
        icon:     "icons/magic/holy/yin-yang-balance-symbol.webp",
        disabled: false,
        duration: {
            seconds:   86400,
            startTime: game.time.worldTime
        }
    };

    await createEffects({ actorData: targetActor, effects: [effectData] });
}

/**
 * Applies Goblin Pox to the target actor
 * @param {Actor5e} targetActor Target actor to update
 */
async function setGoblinPox (targetActor) {
    const effectData = {
        label: "Goblin Pox",
        changes: [{
            key:      "StatusEffect",
            value:    "Convenient Effect: Poisoned",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            priority: 20
        }],
        icon: "assets/icons/dnd5e/monsters/features/passive/goblin-pox.webp",
        disabled: false,
        duration: {
            seconds: 604800,
            startTime: game.time.worldTime
        }
    };

    await createEffects({ actorData: targetActor, effects: [effectData] });
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
