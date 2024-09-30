/* ==========================================================================
    Macro:         Produce Flame
    Source:        https://www.patreon.com/posts/produce-flame-51998583
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Produce Flame",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    itemLabel: "Produce Flame (Attack)",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Get source item --------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const orgItem = await compendium.getDocuments({ name: props.itemLabel });

    if (orgItem.length === 0) {
        return false;
    }

    // Mutate the item --------------------------------------------------------
    const itemData = foundry.utils.duplicate(orgItem[0]);
    const { spellLevel } = props.actorData.getRollData().details;
    const spellDamage = spellLevel < 3 ? 1 :
        spellLevel < 6 ? 2 :
            spellLevel < 0 ? 3 : 4;

    itemData.name = props.itemLabel;
    itemData.system.damage.parts = [[`${spellDamage}d8`, "fire"]];

    // Add item to target -----------------------------------------------------
    await addItem({ actorData: props.actorData, itemData });
}

if (props.state === "off") {
    await removeItem({ actorData: props.actorData, itemLabel: props.itemLabel });
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
        return item.name === itemLabel;
    });

    if (!getItem) {
        return {};
    }

    return await actorData.deleteEmbeddedDocuments("Item", [getItem.id])
}
