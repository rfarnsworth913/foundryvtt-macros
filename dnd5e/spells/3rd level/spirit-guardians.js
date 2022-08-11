/* ==========================================================================
    Macro:         Spirit Guardians
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spirit Guardians",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    damageType: tokenData.actor.getRollData().details.alignment.includes("Evil") ? "necrotic" : "radiant",
    spellLevel: lastArg.spellLevel,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const itemData = {
        "name": "Spirit Guardians (Attack)",
        "type": "feat",
        "img": "worlds/assets/icons/spells/3rd%20level/spirit-guardians.png",
        "data": {
            "description": {
                "value": "<p><a href=\"https://www.dndbeyond.com/spells/spirit-guardians\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Spirit Guardians</a></p>\n<h3><strong>Summary</strong></h3>\n<p>You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.</p>\n<p>Handler for applying attacks manually.</p>",
            },
            "source": "Player's Handbook",
            "activation": {
                "type": "special",
                "cost": 1
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
                "value": 15,
                "long": null,
                "units": "ft"
            },
            "ability": "",
            "actionType": "save",
            "attackBonus": 0,
            "chatFlavor": "",
            "critical": {
                "threshold": null,
                "damage": ""
            },
            "damage": {
                "parts": [[`${props.spellLevel}d8`, props.damageType]],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "wis",
                "dc": null,
                "scaling": "spell"
            },
            "requirements": "Spirit Guardians Active",
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
                "halfdam": true,
                "rollOther": false,
                "critOther": false,
                "magicdam": true,
                "magiceffect": true,
                "concentration": false,
                "toggleEffect": false
            },
            "core": {
                "sourceId": "Item.gVDGdMkukyiPoK9f"
            }
        }
    };

    await props.actorData.createEmbeddedDocuments("Item", [itemData]);
}

if (props.state === "off") {
    await removeItem({
        actorData: props.actorData,
        itemLabel: "Spirit Guardians (Attack)"
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
