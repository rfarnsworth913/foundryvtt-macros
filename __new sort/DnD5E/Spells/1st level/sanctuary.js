/* ==========================================================================
    Macro:         Sanctuary
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg    = args[args.length - 1];
const tokenData  = canvas.tokens.get(lastArg?.tokenId) || {};
const casterData = DAE.DAEfromUuid(lastArg.efData.origin.substring(0, lastArg.efData.origin.indexOf("Item") - 1));

const props = {
    name: "Sanctuary",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    saveDC: casterData.getRollData().attributes.spelldc,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const itemData = {
        "name": "Sanctuary (Shield)",
        "type": "feat",
        "img": "icons/magic/defensive/barrier-shield-dome-blue-purple.webp",
        "data": {
            "description": {
                "value": "<p><a href=\"https://www.dndbeyond.com/spells/sanctuary\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Sanctuary</a></p>\n<h3><strong>Summary</strong></h3>\n<p>You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from area effects, such as the explosion of a fireball.</p>\n<p>If the warded creature makes an attack, casts a spell that affects an enemy, or deals damage to another creature, this spell ends.</p>",
                "chat": "",
                "unidentified": ""
            },
            "source": "Player's Handbook",
            "activation": {
                "type": "reaction",
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
                "value": null,
                "long": null,
                "units": "any"
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
            "actionType": "save",
            "attackBonus": 0,
            "chatFlavor": "",
            "critical": {
                "threshold": null,
                "damage": ""
            },
            "damage": {
                "parts": [],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "wis",
                "dc": props.saveDC,
                "scaling": "flat"
            },
            "requirements": "Sanctuary on Self",
            "recharge": {
                "value": null,
                "charged": false
            }
        },
        "effects": [],
        "flags": {
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
                "magiceffect": false,
                "concentration": false,
                "toggleEffect": false
            },
            "exportSource": {
                "world": "hard-knocks",
                "system": "dnd5e",
                "coreVersion": "9.269",
                "systemVersion": "1.6.3"
            },
            "autoanimations": {
                "version": 4,
                "killAnim": false,
                "options": {
                    "ammo": false
                },
                "override": true,
                "autoOverride": {
                    "enable": false
                },
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
                "animLevel": false,
                "animType": "t1"
            },
        }
    };

    await props.actorData.createEmbeddedDocuments("Item", [itemData]);
}

if (props.state === "off") {
    await removeItem({
        actorData: props.actorData,
        itemLabel: "Sanctuary (Shield)"
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
async function removeItem ({
    actorData,
    itemLabel = ""
} = {}) {
    const getItem = actorData.items.find((item) => {
        return item.name === itemLabel;
    });

    if (!getItem) {
        return {};
    }

    return await getItem.delete();
}
