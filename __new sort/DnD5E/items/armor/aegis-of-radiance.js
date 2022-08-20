/* ==========================================================================
    Macro:         Aegis of Radiance
    Source:        Custom
    Usage:         DAE ItemMacro optional: {{ Hex Code }}
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Aegis of Radiance (1)",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Activate Effects -----------------------------------------------------------
if (props.state === "on") {
    await toggleShield(props.actorData, false);
}


// Remove Effects -------------------------------------------------------------
if (props.state === "off") {
    await toggleShield(props.actorData, true);
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
 * Toggles the equiped state of the shield
 *
 * @param {Actor5e}  actor  Actor to be operated on
 * @param {boolean}  state  Equipped state of the shield
 */
async function toggleShield (actor, state) {
    const shield = await getItems({
        actorData: actor,
        itemLabel: "Aegis of Radiance"
    });
    const shieldCopy = duplicate(shield[0]);

    shieldCopy.data.equipped = state;

    actor.updateEmbeddedDocuments("Item", [shieldCopy]);
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
