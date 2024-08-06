/* ==========================================================================
    Macro:         Magic Stone
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Magic Stone",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    itemName:     "Magic Stone",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "on") {

    // Get items from the compendium ------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const compendiumItems = await compendium.getDocuments({ name: props.itemName });

    if (compendiumItems.length === 0) {
        return ui.notifications.error("No items found!");
    }

    const rollData = await props.actorData.getRollData();
    const newDamageFormula = `1d6 + ${rollData.attributes.spellmod}`;
    const itemData = await foundry.utils.duplicate(compendiumItems[0]);
    itemData.system.damage.parts[0][0] = newDamageFormula;

    // Add and remove items from inventory ------------------------------------
    await removeItem({ actorData: props.actorData, itemLabel: props.itemName });
    await addItem({ actorData: props.actorData, itemData });
}

if (props.state === "off") {
    await removeItem({ actorData: props.actorData, itemLabel: props.itemName });
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
 * Creates an item in the specified actor's inventory
 *
 * @param    {Actor5e}  actorData  Actor to be operated on
 * @param    {Item5e}   itemData   Item to be added
 * @returns  {Promise}             Removal handler
 */
async function addItem ({ actorData, itemData } = {}) {
    return await actorData.createEmbeddedDocuments("Item", [itemData]);
}

/**
 * Finds and removes an item from the specified actor's inventory
 *
 * @param    {Actor5e}  actorData  Actor to be operated on
 * @param    {String}   itemLabel  Item name to be removed from inventory
 * @returns  {Promise}             Removal handler
 */
async function removeItem ({ actorData, itemLabel = "" } = {}) {
    const getItem = actorData.items.find((item) => {
        return item.name === itemLabel && item.type === "weapon";
    });

    if(!getItem) {
        return {};
    }

    return await actorData.deleteEmbeddedDocuments("Item", [getItem.id]);
}
