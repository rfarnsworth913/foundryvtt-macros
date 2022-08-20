/* ==========================================================================
    Macro:         Enchant Weapon
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Enchant Weapon",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    allowMagical: false,
    itemFilter:   [],

    dialogTitle:  "Enhance Weapon",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Get items to modify ----------------------------------------------------
    const items = await getItems({
        actorData:    props.actorData,
        allowMagical: props.allowMagical,
        itemFilter:   props.itemFilter
    });

    if (items.length === 0) {
        return ui.notifications.error(`Could not find items to enchant on actor ${props.actorData.name}`);
    }

    // Generate dialog content ------------------------------------------------
    let dialogContent = "";

    items.forEach((item) => {
        dialogContent += `
            <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
                <input type="radio" id="${item.uuid}" name="${item.name}" ${dialogContent.length > 0 ? "" : "checked"} />
                <img src="${item.img}" height="30px" width="30px" style="margin-left: 7px; margin-right: 7px; alt=${item.name} />
                <label for="${item.name}">${item.name}</label>
            </div>
        `;
    });

    // Display dialog ---------------------------------------------------------
    new Dialog({
        title: props.dialogTitle,
        content: `
            <form class="flexcol">
                <fieldset>
                    ${dialogContent}
                </fieldset>
            </form>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const selectedOption = html.find("input:checked")?.[0];
                    await applyUpdates(selectedOption?.id);
                }
            },
            cancel: {
                icon: "<i class=\"fas fa-times\"></i>",
                label: "Cancel"
            }
        }
    }).render(true);
}

if (props.state === "off") {
    await removeUpdates();
}

// Apply Effect:
// - Update item information
// - Apply changes to item
// - Animation spell

// Remove Effect:
// - Reset item stats
// - Apply state to item
// - Animations?

// Other:
// - Test global macro for editing other characters
// - Test MidiQOL socket version


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
 * Returns the items that are available for enchantment.  Allow magical applies a filter
 * to allow returning magical items as well as standard items.
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actorData     Actor whose inventory should be checked
 * @param    {boolean}        allowMagical  Allow returning of magical items
 * @param    {Array<string>}  itemFilter    Sub-set of items to filter the items by
 * @returns  {Array<Item5e>}                Array of selected items
 */
async function getItems ({ actorData, allowMagical = false, itemFilter = [] } = {}) {
    if (!actorData) {
        return [];
    }

    // Initial filtering ------------------------------------------------------
    let weapons = actorData.items.filter((item) => {
        return allowMagical ? item.data.type === "weapon" :
            item.data.type === "weapon" && !item.data.data.properties.mgc;
    });

    // Filter weapon types ----------------------------------------------------
    if (itemFilter.length > 0) {
        weapons = weapons.filter((weapon) => {
            return itemFilter.includes(weapon.data.data.baseItem);
        });
    }

    // Sort by item name ------------------------------------------------------
    weapons.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
    });

    return weapons;
}

async function applyUpdates (uuid) {
    const item = fromUuid(uuid);

    // Setup tracking flag ----------------------------------------------------
    DAE.setFlag(props.actorData, "enhanceWeapon", {
        uuid
    });

    console.warn(item, props);
}

async function removeUpdates () {

    // Get tracking flag ------------------------------------------------------
    const flag = DAE.getFlag(props.actorData, "enhanceWeapon");

    if (!flag) {
        return {};
    }

    // Finalize cleanup -------------------------------------------------------
    DAE.unsetFlag(props.actorData, "enhanceWeapon");
}
