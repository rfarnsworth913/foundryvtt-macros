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

let targetData = {};
if (lastArg.hitTargets) {
    targetData = canvas.tokens.get(lastArg?.hitTargets[0]?.id) || {};
    targetData = Object.keys(targetData).length > 0 ? targetData : tokenData;
}

const props = {
    name: "Blessing of the Forge",
    state: args[0]?.tag || args[0] || "unknown",

    caster: {
        actorData: tokenData.actor || {},
        tokenData: tokenData
    },

    target: {
        actorData: targetData.actor || {},
        tokenData: targetData
    },

    animation: {
        intro: "jb2a.magic_signs.circle.02.transmutation.intro.dark_blue",
        loop:  "jb2a.magic_signs.circle.02.transmutation.loop.dark_blue",
        outro: "jb2a.magic_signs.circle.02.transmutation.outro.dark_blue"
    },

    itemData: lastArg.itemData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (props.state === "OnUse") {
    // Get items to modify ----------------------------------------------------
    const items = await getItems({
        actorData: props.target.actorData
    });

    if (items.weapons.length === 0 && items.armor.length === 0) {
        return ui.notifications.error(`Could not find items to enchant on actor ${props.target.actorData.name}`);
    }

    // Generate dialog content ------------------------------------------------
    let dialogContent = "";

    if (items.weapons.length > 0) {
        dialogContent += "<h3><strong>Weapons</strong></h3>";
        dialogContent += getDialogContent(items.weapons, true);
    }

    if (items.armor.length > 0) {
        dialogContent += items.weapons.length > 0 ? "<hr /><h3><strong>Armor</strong></h3>" : "";
        dialogContent += getDialogContent(items.armor, items.weapons.length > 0 ? false : true);
    }


    // Enchant Dialog ---------------------------------------------------------
    new Dialog({
        title: props.dialogTitle,
        content: `
            <div class="form-group flexcol" style="align-items: left; padding: 5px;">
                <fieldset style="border: none">
                    ${dialogContent}
                </fieldset>
            </div>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const itemID   = html.find("input:checked")[0].id;
                    const itemData = await fromUuid(itemID);

                    await applyEffects({
                        caster: props.caster,
                        target: props.target,
                        itemData
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
    removeEffects({ actorData: props.caster.actorData });
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
 * Returns the collection of non-magical weapons and armor that the player has
 * in their inventory
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actorData     Actor whose inventory should be checked
 * @returns  {Array<Item5e>}                Array of selected items
 */
async function getItems ({ actorData } = {}) {
    const armorTypes = ["heavy", "light", "medium", "shield"];
    const items = {
        weapons: [],
        armor:   []
    };

    if (!actorData) {
        return items;
    }

    // Initial filtering ------------------------------------------------------
    actorData.items.forEach((item) => {
        if (item.type === "weapon" && !item.system.properties.mgc) {
            items.weapons.push(item);
        }

        if (item.type === "equipment" &&
            armorTypes.includes(item.system.armor.type) &&
            !item.flags?.magicitems.enabled) {
            items.armor.push(item);
        }
    });

    // Sort by item name ------------------------------------------------------
    items.weapons.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
    });

    items.armor.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
    });

    return items;
}

/**
 * Returns the standardized dialog content formatting
 *
 * @param    {Array<Item5e}  items    Items to process
 * @param    {boolean}       checked  Allow checked flag for first item
 * @returns                           Formatted dialog content
 */
function getDialogContent (items, checked = false) {
    let dialogContent = "";

    items.forEach((item) => {
        dialogContent += `
        <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
            <input type="radio" id="${item.uuid}" name="enhancedItem" ${dialogContent.length === 0 && checked ? "checked" : ""} />
            <img src="${item.img}" height="30px" width="30px" style="margin-left: 7px; margin-right: 7px; alt=${item.name} />
            <label for="${item.name}">${item.name}</label>
        </div>
        `;
    });

    return dialogContent;
}

/**
 * Plays an animation on the character showing the effect being applied
 *
 * @param  {Token5e}  target  Where animation should be played
 */
function playAnimation (target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file(props.animation.intro)
                .atLocation(target)
                .scaleToObject(2)
                .belowTokens()
                .waitUntilFinished(-550)
            .effect()
                .file(props.animation.loop)
                .atLocation(target)
                .scaleToObject(2)
                .belowTokens()
                .fadeIn(200)
                .fadeOut(200)
                .waitUntilFinished(-550)
            .effect()
                .file(props.animation.outro)
                .atLocation(target)
                .scaleToObject(2)
                .belowTokens()
            .play();
    }
}

/**
 * Handles applying changes to the specified items
 *
 * @param  {object}  [options]
 * @param  {object}  caster    Wrapper for caster actor and token data
 * @param  {object}  target    Wrapper for target actor and token data
 * @param  {Item5e}  itemData  Item to be operated item
 */
async function applyEffects ({ caster, target, itemData } = {}) {
    const itemCopy = duplicate(itemData);
    const itemType = itemCopy.type;

    // Set tracking flag ------------------------------------------------------
    DAE.setFlag(caster.actorData, "BlessingForge", {
        actorID:  target.tokenData.actor.id,
        itemName: itemData.name
    });

    // Update item information ------------------------------------------------
    const updates = { embedded: { Item: { [itemData.name]: { name: `${itemData.name} (Blessed)` } } } };

    if (itemType === "equipment") {
        updates.embedded.Item[itemData.name] = {
            ...updates.embedded.Item[itemData.name],
            "system.armor.value": itemCopy.system.armor.value + 1
        };
    } else {
        updates.embedded.Item[itemData.name] = {
            ...updates.embedded.Item[itemData.name],
            "system.damage.parts": [[`${itemCopy.system.damage.parts[0][0]} + 1`, itemCopy.system.damage.parts[0][1]]],
            "system.attackBonus":  itemCopy.system.attackBonus.length > 0 ?`${itemCopy.system.attackBonus} + 1` : 1,
            "system.properties.mgc": true
        };
    }

    // Apply changes ----------------------------------------------------------
    await warpgate.mutate(target.tokenData.document, updates, {}, {
        name:        "Blessing of the Forge",
        description: "Blessing of the Forge"
    });

    ChatMessage.create({
        content: `${itemData.name}  has been enhanced.`
    });

    playAnimation(caster.tokenData);
}

/**
 * Handles removing changes to the specified items
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actorData  Actor to be operated on
 */
async function removeEffects ({ actorData } = {}) {

    // Get dependencies -------------------------------------------------------
    const flag = DAE.getFlag(actorData, "BlessingForge");

    if (!flag) {
        return false;
    }

    // Get target -------------------------------------------------------------
    const target = canvas.tokens.placeables.filter((token) => {
        return token.document.actorId === flag.actorID ? canvas.tokens.get(token.id) : false;
    });

    if (target.length === 0) {
        return false;
    }

    // Restore original stats -------------------------------------------------
    await warpgate.revert(target[0].document, "Blessing of the Forge");
    DAE.unsetFlag(actorData, "BlessingForge");

    ChatMessage.create({
        content: `${flag.itemName}  has reverted to it's original state.`
    });
}
