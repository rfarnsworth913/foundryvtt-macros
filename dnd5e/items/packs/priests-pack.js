/* ==========================================================================
    Macro:         Priest's Pack
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Priest's Pack",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: await fromUuid(lastArg.actorUuid),
    tokenData,

    lastArg,

    compendiumID: "shared-compendiums.equipment",
    items: [
        {
            label: "Alms Box",
            count: 1
        },
        {
            label: "Backpack",
            count: 1
        },
        {
            label: "Blanket",
            count: 1
        },
        {
            label: "Block of Incense",
            count: 2
        },
        {
            label: "Candle",
            count: 10
        },
        {
            label: "Censer",
            count: 1
        },
        {
            label: "Rations (1 day)",
            count: 2
        },
        {
            label: "Tinderbox",
            count: 1
        },
        {
            label: "Vestments",
            count: 1
        },
        {
            label: "Waterskin",
            count: 1
        }
    ]
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Add items to inventory -------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    props.items.forEach(async (item) => {
        const orgItem = await compendium.getDocuments({ name: item.label });

        if (orgItem.length === 0) {
            return false;
        }

        const itemData = duplicate(orgItem[0]);
        itemData.system.quantity = item.count;

        props.actorData.createEmbeddedDocuments("Item", [itemData]);
    });

    // Remove original item from inventory ------------------------------------
    await removeItem({
        actorData: props.actorData,
        itemLabel: props.name
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

    return await getItem.delete();
}
