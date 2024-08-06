/* ==========================================================================
    Macro:         Right Tool for the Job
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Right Tool for the Job",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.equipment",
    itemLabels: ["art", "thief"],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Get items from the compendium ----------------------------------------------
const compendium = game.packs.get(props.compendiumID);
const compendiumItems = await compendium.getDocuments();

const selectedItems = compendiumItems.reduce((acc, item) => {
    if (item.type === "tool" &&
       (props.itemLabels.includes(item.system.type.baseItem) || props.itemLabels.includes(item.system.type.value))) {
        acc.push(item);
    }

    return acc;
}, []);

if (selectedItems.length === 0) {
    return ui.notifications.error("No tools found!");
}


// Select Item ----------------------------------------------------------------
const dialogContent = selectedItems.reduce((acc, item, index) => {
    return acc += `
        <label for="${index}" class="radio-label">
            <input type="radio" name="tool" value="${index}" />
            ${item.name}
        </label>
    `;
}, "");

new Dialog({
    title: "Summon Tool",
    content: `
        <style>
            #summonTool .form-group {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                align-items: flex-start;
                max-height: 400px;
                overflow-y: auto;
                overflow-x: hidden;
                margin-bottom: 15px;
            }

            #summonTool .radio-label {
                display: flex;
                flex-direction: row;
                align-items: center;
                text-align: center;
                justify-content: flex-start;
                flex: 0 0 100%;
                line-height: normal;
                padding: 5px;
                cursor: pointer;
            }

            #summonTool input {
                margin: 0 10px 0 0;
                top: 0;
            }
        </style>
        <form id="summonTool">
            <section class="form-group">
                ${dialogContent}
            </section>
        </form>
    `,
    buttons: {
        summon: {
            label: "Summon",
            callback: async (html) => {
                // Get item to summon -----------------------------------------
                const itemIndex = html.find("input[name='tool']:checked").val();

                if (!itemIndex) {
                    return ui.notifications.error("No tool selected!");
                }

                const itemData  = foundry.utils.duplicate(selectedItems[itemIndex]);
                itemData.name += " (Artificer Tool)";

                // Handle Adding and Removing Items
                await removeItem({ actorData: props.actorData });
                await addItem({ actorData: props.actorData, itemData });
            }
        },
        cancel: {
            label: "Cancel"
        }
    }
}).render(true);


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
 * @returns  {Promise}             Removal handler
 */
async function removeItem ({ actorData } = {}) {
    const getItem = actorData.items.find((item) => {
        return item.name.includes("(Artificer Tool)");
    });

    if(!getItem) {
        return {};
    }

    return await actorData.deleteEmbeddedDocuments("Item", [getItem.id]);
}
