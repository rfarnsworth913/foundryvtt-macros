/* ==========================================================================
    Macro:              Aura of Vitality
    Description:        Handles creation and removal of healing ability
    Source:             Custom
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return false;
    }

    // Add ability to character
    if (props.state === "on") {
        const itemData = {
            "name": "Aura of Vitality (Heal)",
            "type": "feat",
            "img": "worlds/assets/icons/spells/3rd%20level/aura-of-vitality.png",
            "data": {
                "description": {
                    "value": "<p><a href=\"https://www.dndbeyond.com/spells/aura-of-vitality\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Aura of Vitality</a></p>\n<h3><strong>Summary</strong></h3>\n<p>Healing energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centered on you. You can use a bonus action to cause one creature in the aura (including you) to regain 2d6 hit points.</p>",
                    "chat": "",
                    "unidentified": ""
                },
                "source": "Player's Handbook",
                "activation": {
                    "type": "bonus",
                    "cost": 1,
                    "condition": ""
                },
                "duration": {
                    "value": null,
                    "units": "inst"
                },
                "target": {
                    "value": 1,
                    "width": null,
                    "units": "",
                    "type": "creature"
                },
                "range": {
                    "value": 30,
                    "long": null,
                    "units": "ft"
                },
                "uses": {
                    "value": null,
                    "max": "",
                    "per": ""
                },
                "consume": {
                    "type": "",
                    "target": "",
                    "amount": null
                },
                "ability": "",
                "actionType": "heal",
                "attackBonus": 0,
                "chatFlavor": "",
                "critical": {
                    "threshold": null,
                    "damage": ""
                },
                "damage": {
                    "parts": [
                        [
                            "2d6",
                            "healing"
                        ]
                    ],
                    "versatile": ""
                },
                "formula": "",
                "save": {
                    "ability": "",
                    "dc": null,
                    "scaling": "spell"
                },
                "requirements": "Paladin; Battle Smith; Oath of the Crown;  Twilight Domain",
                "recharge": {
                    "value": null,
                    "charged": false
                }
            },
            "effects": [],
            "flags": {
                "scene-packer": {
                    "hash": "3022d83b6f2d0063f1f7f1d5475f0d824d723a9a",
                    "sourceId": "Item.5FrK7qU9JXJnbYgH"
                },
                "magicitems": {
                    "enabled": false,
                    "equipped": false,
                    "attuned": false,
                    "charges": "0",
                    "chargeType": "c1",
                    "destroy": false,
                    "destroyFlavorText": "reaches 0 charges: it crumbles into ashes and is destroyed.",
                    "rechargeable": false,
                    "recharge": "0",
                    "rechargeType": "t1",
                    "rechargeUnit": "r1",
                    "sorting": "l"
                },
                "midi-qol": {
                    "effectActivation": false
                },
                "midiProperties": {
                    "nodam": false,
                    "fulldam": false,
                    "halfdam": false,
                    "rollOther": false,
                    "critOther": false,
                    "magicdam": false,
                    "magiceffect": true,
                    "concentration": false,
                    "toggleEffect": false
                },
                "autoanimations": {
                    "version": 4,
                    "killAnim": false,
                    "animLevel": false,
                    "options": {
                        "ammo": false,
                        "staticType": "target",
                        "menuType": "spell",
                        "variant": "01",
                        "enableCustom": false,
                        "repeat": null,
                        "delay": null,
                        "scale": null,
                        "opacity": null,
                        "unbindAlpha": false,
                        "unbindVisibility": false,
                        "persistent": false
                    },
                    "override": true,
                    "sourceToken": {
                        "enable": false
                    },
                    "targetToken": {
                        "enable": false
                    },
                    "levels3d": {
                        "type": ""
                    },
                    "macro": {
                        "enable": false
                    },
                    "animType": "static",
                    "animation": "curewounds",
                    "color": "blue",
                    "audio": {
                        "a01": {
                            "enable": false
                        }
                    },
                    "preview": true,
                    "explosions": {
                        "enable": false
                    }
                },
                "core": {
                    "sourceId": "Item.5FrK7qU9JXJnbYgH"
                },
                "exportSource": {
                    "world": "hard-knocks",
                    "system": "dnd5e",
                    "coreVersion": "9.269",
                    "systemVersion": "1.6.2"
                }
            }
        };
        await props.actorData.createEmbeddedDocuments("Item", [itemData]);
    }

    // Remove ability from character
    if (props.state === "off") {
        await removeItem({
            actorData: props.actorData,
            itemLabel: "Aura of Vitality (Heal)"
        });
    }

})();

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


// Property Helpers -----------------------------------------------------------

/**
 * Extracts properties from passed in values and assigns them to a common object which
 * is eaiser to access
 *
 * @returns  Extracted property values as object
 */
function getProps () {
    const lastArg = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name: "Aura of Vitality",
        state: args[0] || "",

        actorData: tokenData.actor || {},
        tokenData
    };
}

/**
 * Logs the extracted property values to the console for debugging purposes
 */
function logProps (props, title) {
    console.group(`${title} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Takes the properties object and validates that all specified values have been defined before trying to execute
 * the macro
 *
 * @param  props  Properties to be evaluated
 */
function validateProps (props) {
    const missingProps = [];

    Object.keys(props).forEach((key) => {
        if (!props[key] || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
