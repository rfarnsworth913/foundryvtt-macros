/* ==========================================================================
    Macro:         Voracious Aura
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Voracious Aura",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    tokenID: args[1],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
// Update caster HP

if ((props.state === "on" || props.state === "each") &&
    props.tokenID !== props.lastArg.tokenId) {

    // Request Roll -----------------------------------------------------------
    await game.MonksTokenBar.requestRoll([props.tokenData], {
        request:  "save:con",
        dc:       14,
        flavor:   props.name,
        showdc:   false,
        silent:   true,
        contiune: "failed",
        rollmode: "roll",
        callback: async ({ tokenresults }) => {
            tokenresults.forEach(async () => {
                const damageRoll = await new Roll("2d6").roll({ async: true });
                await createEffect(damageRoll.total);
                await healCaster(damageRoll);
            });
        }
    });
}


/**
 * Applies the HP reduction effect to the target
 *
 * @param {number} hpChange HP subtracted from target's HP pool
 */
async function createEffect (hpChange) {
    const itemData = await fromUuid(props.lastArg.origin);

    const effectData = [{
        changes: [{
            key:      "system.attributes.hp.max",
            mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
            priority: 20,
            value:    `-${hpChange}`
        }],
        label:    `${props.name} HP Drain`,
        icon:     itemData.img,
        origin:   props.lastArg.origin,
        disabled: false,
        flags: {
            dae: {
                itemData,
                specialDuration: ["longRest"],
                stackable:       "multi"
            }
        }
    }];

    await createEffects({
        actorData: props.actorData,
        effects:   effectData
    });
}

/**
 * Handles healing the zombie (caster)
 *
 * @param {number} hpChange Healing done to zombie
 */
async function healCaster (hpRoll) {
    const caster = await fromUuid(props.lastArg.origin.substring(0, props.lastArg.origin.indexOf("Item") - 1));

    await new MidiQOL.DamageOnlyWorkflow(
        props.actorData,
        props.tokenData,
        hpRoll.total,
        "healing",
        [caster],
        hpRoll,
        {
            flavor:     `${props.name} (Healing)`,
            itemCardId: "new"
        }
    );
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
