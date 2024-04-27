/* ==========================================================================
    Macro:         Arcane Armory
    Source:        https://drive.google.com/file/d/1-psAzph-0TjsBMGR3fmFQXGvzQVdwTXG/view
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Arcane Armory",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Handle Existing Items ------------------------------------------------------
const flaggedItems    = DAE.getFlag(props.actorData, "arcane-armory") || [];
const newTrackedItems = [];
const trackedItems    = await flaggedItems.reduce(async (list, itemUuid) => {
    const itemData    = await fromUuidSync(itemUuid);

    if (itemData) {
        list.push(itemData);
        newTrackedItems.push(itemData.uuid);
    }

    return list;
}, []);

DAE.setFlag(props.actorData, "arcane-armory", newTrackedItems);

// Existing Items for Dialog --------------------------------------------------
const maxStorage = Math.max(1, Number(props.actorData.system.abilities.int.mod) + 1);

let armorContent = "";
let weaponContent = "";

trackedItems.forEach((item) => {
    const typeInfo = item.system.type;

    if (!typeInfo || typeInfo?.label === null) {
        return;
    }

    if (typeInfo.label.toLowerCase().indexOf("armor") > -1 ||
        typeInfo.label.toLowerCase().indexOf("shield") > -1) {
        armorContent += existingItemTemplate(item);
    }

    if (typeInfo.label.toLowerCase().indexOf("martial") > -1 ||
        typeInfo.label.toLowerCase().indexOf("simple") > -1) {
        weaponContent += existingItemTemplate(item);
    }
});

// New Items for Dialog -------------------------------------------------------
let newArmorContent = "";
let newWeaponContent = "";

props.actorData.items.forEach((item) => {
    const typeInfo = item.system.type;

    if (!typeInfo || typeInfo?.label === null) {
        return;
    }

    if ((typeInfo.label.toLowerCase().indexOf("armor") > -1 ||
        typeInfo.label.toLowerCase().indexOf("shield") > -1) &&
        newTrackedItems.indexOf(item.uuid) === -1) {
        newArmorContent += `<option value="${item.uuid}">${item.name}</option>`;
    }

    if ((typeInfo.label.toLowerCase().indexOf("martial") > -1 ||
        typeInfo.label.toLowerCase().indexOf("simple") > -1) &&
        newTrackedItems.indexOf(item.uuid) === -1) {
        newWeaponContent += `<option value="${item.uuid}">${item.name}</option>`;
    }
});

// Dialog Component -----------------------------------------------------------
return new Dialog({
    title: props.name,
    content: `
        <style>
            #arcaneArmoryForm .form-group,
            #arcaneArmoryForm .select-group {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                align-items: flex-start;
                max-height: 400px;
                overflow-y: scroll;
                overflow-x: hidden;
                margin-bottom: 15px;
            }

            #arcaneArmoryForm .select-group {
                justify-content: space-between;
            }

            #arcaneArmoryForm .weapon,
            #arcaneArmoryForm .armor {
                flex: 0 0 100%;
            }

            #arcaneArmoryForm select {
                margin-right: 7px;
                width: 75%;
            }

            #arcaneArmoryForm .radio-label {
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

            #arcaneArmoryForm img {
                border: 0;
                width: 25px;
                height: 25px;
                flex: 0 0 25px;
                margin-right: 10px;
                margin-left: 10px;
            }
        </style>

        <form id="arcaneArmoryForm" class="form-group">
            <p>Choose an item to add or remove from your Arcane Armory.</p>
            <p><strong>Current Items: </strong>${newTrackedItems.length}/${maxStorage}</p>

            <div class="form-group">
                <section class="armor">
                    <h2>Armor</h2>
                    ${armorContent}
                    <hr />
                    <div class="select-group">
                        <label for="newArmor">New Armor: </label>
                        <select id="newArmor" name="newArmor">${newArmorContent}</select>
                    </div>
                </section>

                <section class="weapon">
                    <h2>Weapons</h2>
                    ${weaponContent}
                    <hr />
                    <div class="select-group">
                        <label for="newWeapons">New Weapon: </label>
                        <select id="newWeapons" name="newWeapons">${newWeaponContent}</select>
                    </div>
                </section>
            </div>
        </form>
    `,
    buttons: {
        newArmor: {
            label: "New Armor",
            callback: async (html) => {
                if (newTrackedItems.length >= maxStorage) {
                    return ui.notifications.error("You have reached the maximum number of items you can track.");
                }

                const armorUuid = html.find("select[name='newArmor']").val();
                newTrackedItems.push(armorUuid);
                const itemData = await fromUuidSync(armorUuid);
                const itemDataCopy = duplicate(itemData);

                const effectData = {
                    changes: [
                        {
                            key:      "system.attributes.ac.formula",
                            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value:    "10 + @abilities.int.mod",
                            priority: 30
                        },
                        {
                            key:      "system.attributes.ac.calc",
                            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                            value:    "custom",
                            priority: 30
                        }
                    ],
                    label:    `${itemDataCopy.name} (AA)`,
                    origin:   itemDataCopy.uuid,
                    icon:     itemDataCopy.img
                };

                const updates = {
                    embedded: {
                        Item: {
                            [itemDataCopy.name]: {
                                ...itemDataCopy,
                                name: `${itemDataCopy.name} (AA)`,
                                "effects": [
                                    ...itemDataCopy.effects,
                                    effectData
                                ],
                                "system.properties": [...itemDataCopy.system.properties, "mgc"]
                            }
                        }
                    }
                };

                await warpgate.mutate(props.tokenData.document, updates, {}, {
                    name: armorUuid,
                    description: `Adding ${itemDataCopy.name} to Arcane Armory.`
                });
                DAE.setFlag(props.actorData, "arcane-armory", newTrackedItems);
            }
        },
        newWeapon: {
            label: "New Weapon",
            callback: async (html) => {
                if (newTrackedItems.length >= maxStorage) {
                    return ui.notifications.error("You have reached the maximum number of items you can track.");
                }

                const weaponUuid = html.find("select[name='newWeapons']").val();
                newTrackedItems.push(weaponUuid);
                const itemData = await fromUuidSync(weaponUuid);
                const itemDataCopy = duplicate(itemData);

                const updates = {
                    embedded: {
                        Item: {
                            [itemDataCopy.name]: {
                                ...itemDataCopy,
                                name: `${itemDataCopy.name} (AA)`,
                                "system.properties": [...itemDataCopy.system.properties, "mgc"]
                            }
                        }
                    }
                };

                await warpgate.mutate(props.tokenData.document, updates, {}, {
                    name: weaponUuid,
                    description: `Adding ${itemDataCopy.name} to Arcane Armory.`
                });
                DAE.setFlag(props.actorData, "arcane-armory", newTrackedItems);
            }
        },
        removeExisting: {
            label: "Remove Existing",
            callback: async (html) => {
                let index = -1;
                const itemUuid = html.find("input[name='arcaneArmoryForm']:checked").val();

                newTrackedItems.forEach((item, i) => {
                    if (item === itemUuid) {
                        index = i;
                    }
                });

                if (index > -1) {
                    newTrackedItems.splice(index, 1);
                    DAE.setFlag(props.actorData, "arcane-armory", newTrackedItems);
                    warpgate.revert(props.tokenData.document, itemUuid);
                }
            }
        },
        cancel: {
            label: "Cancel"
        }
    }
}, { width: 500 }).render(true);


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

function existingItemTemplate (item) {
    return `
            <label for="${item.uuid}" class="radio-label">
                <input type="radio" id="${item.uuid}" name="arcaneArmoryForm" value="${item.uuid}" />
                <img src="${item.img}" style="border: 0; width: 25px; height: 25px;" />
                ${item.name}
            </label>
        `;
}
