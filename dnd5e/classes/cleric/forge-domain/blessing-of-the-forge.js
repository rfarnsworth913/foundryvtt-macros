/* ==========================================================================
    Macro:         Blessing of the Forge
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blessing of the Forge",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Get Item Information ---------------------------------------------------
    const items = await getItems({ actorData: props.actorData });
    let itemList = "";

    items.forEach((item) => {
        itemList += `<option value="${item.id}">${item.name}</option>`;
    });

    if (itemList.length === 0) {
        return ui.notifications.error("No valid items were found in your inventory");
    }

    // Request Dialog ---------------------------------------------------------
    new Dialog({
        title: "Choose an item to enhance",
        content: `
            <div class="form-group flexrow" style="align-items: center; padding: 5px;">
                <label style="flex-grow: 1;">Items: </label>
                <select style="flex-grow: 3;" id="items">
                    ${itemList}
                </select>
            </div>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const itemID   = html.find("#items").val();
                    const itemData = props.actorData.items.get(itemID);

                    applyEffects({
                        actorData: props.actorData,
                        itemData:  itemData
                    });
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
    removeEffects({
        actorData: props.actorData
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Returns the collection of non-magical weapons and armor that the player has
 * in their inventory
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData } = {}) {
    const armorTypes = ["heavy", "light", "medium", "shield"];

    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return (item.data.type === "weapon" && !item.data.data.properties.mgc) ||
               (item.data.type === "equipment" &&
               (armorTypes.includes(item.data.data.armor.type) &&
               !item.data.flags?.magicitems.enabled));
    }));
}

/**
 * Handles applying changes to the specified items
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actorData  Actor to be operated on
 * @param  {Item5e}   itemData   Item to be operated item
 */
async function applyEffects ({ actorData, itemData } = {}) {
    const itemCopy = duplicate(itemData);
    const itemType = itemCopy.type;

    // Set tracking flag ------------------------------------------------------
    DAE.setFlag(actorData, "BlessingForge", {
        id:     itemData.id,
        ac:     itemType === "equipment" ? itemCopy.data.armor.value : 0,
        damage: itemType === "weapon" ? itemCopy.data.damage.parts[0][0] : 0,
        attack: itemType === "weapon" ? itemCopy.data.attackBonus : 0
    });

    // Update item information ------------------------------------------------
    if (itemType === "equipment") {
        itemCopy.data.armor.value = itemCopy.data.armor.value + 1;
    } else {
        itemCopy.data.damage.parts[0][0] = `${itemCopy.data.damage.parts[0][0]} + 1`;
        itemCopy.data.attackBonus = itemCopy.data.attackBonus.length > 0 ?`${itemCopy.data.attackBonus} + 1` : 1;
    }

    itemCopy.name = `${itemCopy.name} (Blessed)`;

    // Apply changes ----------------------------------------------------------
    actorData.updateEmbeddedDocuments("Item", [itemCopy]);
    ChatMessage.create({
        content: `${itemData.name}  has been enhanced.`
    });

    playAnimation();
}

/**
 * Plays an animation on the character showing the effect being applied
 */
function playAnimation () {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.magic_signs.circle.02.transmutation.intro.green")
                .atLocation(props.token)
                .scaleToObject(1.5)
                .belowTokens()
                .waitUntilFinished(-550)
            .effect()
                .file("jb2a.magic_signs.circle.02.transmutation.loop.green")
                .atLocation(props.token)
                .scaleToObject(1.5)
                .belowTokens()
                .fadeIn(200)
                .fadeOut(200)
                .waitUntilFinished(-550)
            .effect()
                .file("jb2a.magic_signs.circle.02.transmutation.outro.green")
                .atLocation(props.token)
                .scaleToObject(1.5)
                .belowTokens()
            .play();
    }
}

/**
 * Handles removing changes to the specified items
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actorData  Actor to be operated on
 */
async function removeEffects ({ actorData } = {}) {
    const flag = DAE.getFlag(actorData, "BlessingForge");

    // Check flag status ------------------------------------------------------
    if (!flag) {
        return false;
    }

    // Restore original stats -------------------------------------------------
    const item = actorData.items.get(flag.id);

    if (item) {
        const itemCopy = duplicate(item);

        if (itemCopy.type === "equipment") {
            itemCopy.data.armor.value = flag.ac;
        } else {
            itemCopy.data.damage.parts[0][0] = flag.damage;
            itemCopy.data.attackBonus = flag.attack;
        }

        itemCopy.name = itemCopy.name.replace(" (Blessed)", "");

        actorData.updateEmbeddedDocuments("Item", [itemCopy]);
        ChatMessage.create({
            content: `${itemCopy.name}  has returned to normal`
        });
    }

    DAE.unsetFlag(actorData, "BlessingForge");
}
