/* ==========================================================================
    Macro:         Superior Inspiration
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Superior Inspiration ",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    flagID: "superiorInspiration",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("dnd5e.preRollInitiative", async () => {
        const item = await getItems({ actorData: props.actorData, itemLabel: "Bardic Inspiration" });

        if (item[0].system.uses.value === 0) {
            const updates = [{ _id: item[0].id, "system.uses.value": 1 }];
            await updateItem({ actorData: props.actorData, updates });
        }
    });

    DAE.setFlag(props.actorData, props.flagID, hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, props.flagID);
    DAE.unsetFlag(props.actorData, props.flagID);

    Hooks.off("dnd5e.preRollInitiative", hookID);
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

/**
 * Updates a collection of items on the specified actor
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {Array}     updates     Updates to be applied
 * @returns  Array<Actor>            Actors that have been updated
 */
async function updateItem ({ actorData, updates } = {}) {
    if (!actorData) {
        return console.error("No item specified");
    }

    return await actorData.updateEmbeddedDocuments("Item", updates);
}
