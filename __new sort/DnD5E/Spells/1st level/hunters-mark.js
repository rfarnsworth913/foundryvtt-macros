/* ==========================================================================
    Macro:         Hunter's Mark
    Source:        MidiQOL Examples
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Hunter's Mark",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    hitTargets: lastArg.hitTargets,
    isCritical: lastArg.isCritical || false,
    itemData:   lastArg.item,
    itemID:     lastArg.itemUuid,
    spellLevel: lastArg.spellLevel,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.hitTargets.length === 0) {
    return false;
}


// Setup Active Effect --------------------------------------------------------
if (props.state === "OnUse") {
    const targetUUID = props.hitTargets[0].uuid;
    const duration   = props.spellLevel >= 5 ? 86400 : props.spellLevel >= 3 ? 38800 : 3600;

    if (!props.actorData || !targetUUID) {
        console.error("Hunter's Mark: no token/target selected!");
        return false;
    }

    const effectData = {
        changes: [
            {
                key:      "flags.midi-qol.huntersMark",
                mode:     5,
                value:    targetUUID,
                priority: 20
            },
            {
                key:      "flags.dnd5e.DamageBonusMacro",
                mode:     0,
                value:    `ItemMacro.${props.itemData.name}`,
                priority: 20
            }
        ],
        origin:   props.itemID,
        disabled: false,
        duration: props.itemData.effects[0].duration,
        icon:     props.itemData.img,
        label:    props.itemData.name
    };

    effectData.duration.seconds = duration;
    effectData.duration.startTime = game.time.worldTime;
    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

    if (props.spellLevel > 1) {
        await wait(500);

        const effect = await getEffect({
            actorData: props.actorData,
            effectLabel: "Concentrating"
        });

        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
            _id: effect.id,
            duration: {
                seconds: duration
            }
        }]);
    }
}


// Handle Bonus Damage --------------------------------------------------------
if (props.state === "DamageBonus") {
    if (!["mwak", "rwak"].includes(props.itemData.data.actionType)) {
        return false;
    }

    const targetUUID = props.hitTargets[0].uuid;
    if (targetUUID !== getProperty(props.actorData.flags, "midi-qol.huntersMark")) {
        return false;
    }

    const damageType = props.itemData.data.damage.parts[0][1];
    const diceMulti  = props.isCritical ? 2 : 1;

    return {
        damageRoll: `${diceMulti}d6[${damageType}]`,
        flavor:     "Hunter's Mark"
    };
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}
