/* ==========================================================================
    Macro:         Aura of Vitality
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Aura of Vitality",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
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
            }
        }
    };

    await props.actorData.createEmbeddedDocuments("Item", [itemData]);
}

if (props.state === "off") {
    await removeItem({
        actorData: props.actorData,
        itemLabel: "Aura of Vitality (Heal)"
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

    if(!getItem) {
        return {};
    }

    return await getItem.delete();
}
