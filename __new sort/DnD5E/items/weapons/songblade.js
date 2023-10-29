/* ==========================================================================
    Macro:         Songblade
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Songblade",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (props.state === "on") {

    // Get Bardic Inspiration -------------------------------------------------
    const item = await getItems({
        actorData: props.actorData,
        itemLabel: "Bardic Inspiration"
    });

    if (item.length === 0) {
        return ui.notifications.error("Could not find Bardic Inspiration");
    }

    // Apply Updates ----------------------------------------------------------
    const itemCopy = duplicate(item[0]);
    const updates = { embedded: { Item: { [itemCopy.name]: { } } } };

    updates.embedded.Item[itemCopy.name] = {
        ...updates.embedded.Item[itemCopy.name],
        "system.uses.max": "@abilities.cha.mod + 1"
    };

    // Apply changes ----------------------------------------------------------
    await warpgate.mutate(props.tokenData.document, updates, {}, {
        name: "Songblade",
        description: "Songblade Bardic Inspiration"
    });
}

if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, "Songblade");
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
