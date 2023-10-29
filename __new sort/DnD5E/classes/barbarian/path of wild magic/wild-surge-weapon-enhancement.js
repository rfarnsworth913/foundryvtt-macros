/* ==========================================================================
    Macro:         Wild Surge (Enhance Weapon)
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {

    // General Information ----------------------------------------------------
    name: "Wild Surge (Enhance Weapon)",
    state: args[0]?.tag || args[0] || "unknown",


    // Actor Information ------------------------------------------------------
    caster: {
        actorData: tokenData.actor || {},
        tokenData
    },

    target: {
        actorData: tokenData?.actor || {},
        tokenData
    },

    // Item Filtering ---------------------------------------------------------
    dialogTitle:  "Wild Surge (Enhance Weapon)",
    allowMagical: false,
    itemFilter:   [],

    // Item Modifiers ---------------------------------------------------------
    enhancements: {
        attackBonus: "1",
        damageBonus: "1",
        additionalDamage: ""
    },

    // Casting Animation ------------------------------------------------------
    animation: {
        intro: "jb2a.magic_signs.circle.02.transmutation.intro.dark_red",
        loop:  "jb2a.magic_signs.circle.02.transmutation.loop.dark_red",
        outro: "jb2a.magic_signs.circle.02.transmutation.outro.dark_red"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Get items to modify ----------------------------------------------------
    const items = await getItems({
        actorData:    props.target.actorData,
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
            <form class="form-group flexcol" style="align-items: left; padding: 5px;"
                <fieldset style="border: none">
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
    await removeUpdates({
        actorData: props.caster.actorData
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
        return allowMagical ? item.type === "weapon" :
            item.type === "weapon" && !item.system.properties.mgc;
    });

    // Filter weapon types ----------------------------------------------------
    if (itemFilter.length > 0) {
        weapons = weapons.filter((weapon) => {
            return itemFilter.includes(weapon.system.baseItem);
        });
    }

    // Sort by item name ------------------------------------------------------
    weapons.sort((a, b) => {
        return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
    });

    return weapons;
}

/**
 * Applies updates to the targeted item, tracking the change as a flag on the caster
 *
 * @param  {string}  uuid  Unique Identifier of the item to be modified
 */
async function applyUpdates (uuid) {
    const itemCopy = duplicate(await fromUuid(uuid));

    // Setup tracking flag ----------------------------------------------------
    DAE.setFlag(props.caster.actorData, "wildSurgeEnhanceWeapon", {
        actorID:  props.target.actorData.id,
        itemName: itemCopy.name
    });

    // Define updates ---------------------------------------------------------
    const updates = { embedded: { Item: { [itemCopy.name]: { name: `${itemCopy.name} (Enchanted)` } } } };

    updates.embedded.Item[itemCopy.name] = {
        ...updates.embedded.Item[itemCopy.name],
        "system.damage.parts": [[
            `${itemCopy.system.damage.parts[0][0]}`,
            "force"
        ]],
        "system.properties.mgc": true,
        "system.properties.lgt": true,
        "system.properties.thr": true,
        "system.range.value": 20,
        "system.range.long": 60,
        "system.range.units": "ft"
    };

    // Apply changes ----------------------------------------------------------
    await warpgate.mutate(props.target.tokenData.document, updates, {}, {
        name:        props.name,
        description: `${props.name}: ${itemCopy.name}`
    });

    ChatMessage.create({
        content: `${itemCopy.name}  has been enhanced.`
    });

    playAnimation(props.caster.tokenData);
}

/**
 * Removes the applied effects from the target and reverts the item to it's original state
 *
 * @param  {object}   [options]
 * @param  {Actor5e}  actorData  Caster that is tracking the modified item
 */
async function removeUpdates ({ actorData } = {}) {

    // Get dependencies -------------------------------------------------------
    const flag = DAE.getFlag(actorData, "wildSurgeEnhanceWeapon");

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
    await warpgate.revert(target[0].document, props.name);
    DAE.unsetFlag(actorData, "wildSurgeEnhanceWeapon");

    ChatMessage.create({
        content: `${flag.itemName}  has reverted to it's original state.`
    });
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
