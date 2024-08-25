/* ==========================================================================
    Macro:         Spellmight Gloves
    Source:        Custom
    Usage:         Item Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spellmight Gloves",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.item,
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Check if effect exists and remove it -----------------------------------
    const spellMight = getEffect({
        actorData: props.actorData,
        effectLabel: props.name
    });

    console.warn(spellMight);

    if (spellMight) {
        await removeEffect({
            actorData: props.actorData,
            effectLabel: props.name
        });

        return false;
    }

    // Add effect if it didn't exist before -----------------------------------
    const effects = [{
        changes: [
            {
                key: "system.bonuses.msak.attack",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "-5",
                priority: 20
            },
            {
                key: "system.bonuses.rsak.attack",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "-5",
                priority: 20
            },
            {
                key: "flags.dnd5e.DamageBonusMacro",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "ItemMacro.Spellmight Gloves,",
                priority: 20
            }
        ],
        origin: props.itemData.uuid,
        disabled: false,
        label: props.itemData.name,
        img: props.itemData.img,
        flags: {
            dae: {
                showIcon: true
            }
        }
    }];
    await createEffects({
        actorData: props.actorData,
        effects,
    });
}

if (props.state === "DamageBonus") {
    if (props.itemData.type === "spell" && (props.itemData.system.actionType === "msak" || props.itemData.system.actionType === "rsak")) {
        return {
            damageRoll: `1d8[${props.itemData.system.damage.parts[0][1]}]`,
            flavor: "Spellmight Gloves"
        };
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
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        console.warn(effect.name);
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
        effects: [effect.id]
    });
}
