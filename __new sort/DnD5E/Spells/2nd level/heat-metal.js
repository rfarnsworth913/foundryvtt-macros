/* ==========================================================================
    Macro:         Heat Metal
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Heat Metal",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},

    spellLevel: args[2] || lastArg.spellLevel,
    target:     args[1] ? canvas.tokens.get(args[1]) : lastArg.hitTargets[0],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Setup Tracking -------------------------------------------------------------
if (props.state === "OnUse") {
    const { itemData } = lastArg;
    const effectData = {
        changes: [{
            key:      "macro.itemMacro",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `${props.target.id} ${props.spellLevel}`,
            priority: 20
        }],
        origin: itemData.uuid,
        disabled: false,
        duration: {
            seconds:    60,
            rounds:     10,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        },
        icon:  itemData.img,
        label: itemData.name
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: props.actorData.uuid,
        effects:   [effectData]
    });
}


// Create Effects -------------------------------------------------------------
if (props.state === "on") {

    // Create damage item -----------------------------------------------------
    const itemData = {
        "name": "Heat Metal (Attack)",
        "type": "feat",
        "img": "worlds/assets/icons/spells/2nd%20level/heat-metal.png",
        "data": {
            "description": {
                "value": "<p><a href=\"https://www.dndbeyond.com/spells/heat-metal\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Heat Metal</a></p>\n<h3><strong>Summary</strong></h3>\n<p>Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 fire damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to cause this damage again.</p>\n<p>If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can. If it doesn't drop the object, it has disadvantage on attack rolls and ability checks until the start of your next turn.</p>\n<p><strong>At Higher Levels.</strong> When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.</p>\n<hr />\n<h3><strong>Foundry Usage</strong></h3>\n<ul>\n<li style=\"padding-top: 3px; padding-bottom: 3px;\">If target drops the item, DM should remove item from target's inventory and cleanup effects on target manually</li>\n</ul>"
            },
            "source": "Player's Handbook",
            "activation": {
                "type": "bonus",
                "cost": 1,
                "condition": "Heat Metal status condition is on target"
            },
            "duration": {
                "value": null,
                "units": "inst"
            },
            "target": {
                "value": 1,
                "width": null,
                "units": "",
                "type": "object"
            },
            "range": {
                "value": 60,
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
                "parts": [[`${props.spellLevel}d8`, "fire"]]
            },
            "formula": "",
            "save": {
                "ability": "con",
                "dc": null,
                "scaling": "spell"
            },
            "requirements": "Cast Heat Metal Spell"
        },
        "effects": [
            {
                "_id": "qt8PG5DnUIKoH4GZ",
                "changes": [
                    {
                        "key":      "flags.midi-qol.disadvantage.attack.all",
                        "mode":     2,
                        "value":    "1",
                        "priority": "20"
                    },
                    {
                        "key":      "flags.midi-qol.disadvantage.ability.all",
                        "mode":     2,
                        "value":    "1",
                        "priority": "20"
                    },
                    {
                        "key":      "flags.midi-qol.disadvantage.skill.all",
                        "mode":     2,
                        "value":    "1",
                        "priority": "20"
                    }
                ],
                "disabled": false,
                "duration": {
                    "startTime": game.time.worldTime,
                    "seconds": 12
                },
                "icon": "worlds/assets/icons/spells/2nd%20level/heat-metal.png",
                "label": "Heat Metal (Attack)",
                "origin": props.lastArg.origin,
                "transfer": false,
                "tint": "",
                "selectedKey": [
                    "flags.midi-qol.disadvantage.attack.all",
                    "flags.midi-qol.disadvantage.ability.all",
                    "flags.midi-qol.disadvantage.skill.all"
                ]
            }
        ],
        "flags": {
            "midiProperties": {
                "nodam": false,
                "fulldam": true,
                "halfdam": false,
                "rollOther": false,
                "critOther": false,
                "magicdam": true,
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
                    "menuType": "fire",
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
                "animation": "eruption",
                "color": "orange",
                "audio": {
                    "a01": {
                        "enable": false
                    }
                },
                "preview": true,
                "explosions": {
                    "enable": false
                }
            }
        }
    };

    await props.actorData.createEmbeddedDocuments("Item", [itemData]);

    // Apply tracking effect --------------------------------------------------
    const targetUuid = props.target.actor.uuid;
    const hasEffect  = await game.dfreds.effectInterface.hasEffectApplied("Heat Metal", targetUuid);

    if (!hasEffect) {
        game.dfreds.effectInterface.addEffect({
            effectName: "Heat Metal (Flag)",
            uuid:       targetUuid
        });
    }
}


// Remove Effects -------------------------------------------------------------
if (props.state === "off") {

    // Remove attack from self ------------------------------------------------
    await removeItem({
        actorData: props.actorData,
        itemLabel: "Heat Metal (Attack)"
    });

    // Remove condition from any other target(s) ------------------------------
    const targets = canvas.tokens.placeables.filter((token) => {
        return token.actor.effects.find((effect) => {
            return effect.data.label === "Heat Metal (Flag)";
        });
    });

    targets.forEach((target) => {
        const { uuid } = target.actor;

        game.dfreds.effectInterface.removeEffect({
            effectName: "Heat Metal (Flag)",
            uuid
        });
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
