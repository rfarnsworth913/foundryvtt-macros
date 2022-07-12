/* ==========================================================================
    Macro:         Frenzy
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Frenzy",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Update Duration ------------------------------------------------------------
if (props.state === "on") {
    const persistentRage = await getItem({
        actorData: props.actorData,
        itemLabel: "Persistent Rage"
    });

    if (persistentRage) {
        const frenzy = await getEffect({
            actorData:   props.actorData,
            effectLabel: "Frenzy"
        });

        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
            _id: frenzy.id,
            duration: {
                seconds: 86400
            }
        }]);
    }
}


// Update Exhaustion Levels ---------------------------------------------------
if (props.state === "off") {

    // Check if exhaustion exists on target -----------------------------------
    const effect = await getEffect({
        actorData:   props.actorData,
        effectLabel: "Exhaustion"
    });
    const exhaustionLevel = parseInt(effect?.data?.label?.replace(/[^0-9]/g, "") ?? 0) + 1;

    // Remove Effect ----------------------------------------------------------
    if (effect) {
        await removeEffect({
            actorData:   props.actorData,
            effectLabel: effect.data.label
        });
    }

    // Update Exhaustion Level ------------------------------------------------
    if (exhaustionLevel <= 5) {
        game.dfreds.effectInterface.addEffect({
            effectName: `Exhaustion ${exhaustionLevel}`,
            uuid: props.actorData.uuid
        });
    } else {
        await props.actorData.update({
            "data.attributes.hp.value": 0
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
    console.group(`${props.name} Macro`);
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
        return effect.data.label.toLowerCase().startsWith(effectLabel.toLowerCase());
    }));
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await actorData.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
}
