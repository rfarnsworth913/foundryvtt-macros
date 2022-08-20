/* ==========================================================================
    Macro:         Emboldening Bond
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Emboldening Bond",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData || lastArg.efData.flags.dae.itemData,
    tokenData,

    caster: DAE.DAEfromActorUuid(lastArg.origin?.substring(0, lastArg.origin?.indexOf("Item") - 1)),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Add Emboldening Bond ---------------------------------------------------
    const hookID = Hooks.on("updateCombat", combatRound);
    DAE.setFlag(props.actorData, "emboldenBond", hookID);

    // Add Protective Bond ----------------------------------------------------
    await protectiveBond();
}

if (props.state === "off") {

    // Remove Emboldening Bond -------------------------------------------------
    const hookID = DAE.getFlag(props.actorData, "emboldenBond");
    Hooks.off("updateCombat", hookID);
    DAE.unsetFlag(props.actorData, "emboldenBond");


    // Remove Protective Bond -------------------------------------------------
    await removeItem({
        actorData: props.actorData,
        itemLabel: "Protective Bond (Protect)"
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
 * Handles combat round updates
 */
async function combatRound (combat, update) {
    if ("turn" in update) {
        await bonusEffect(props.actorData, props.itemData);
    }
}

/**
 * Handles applying the bonus effect to the target character
 *
 * @param  {Actor5e}  actorData  Actor to be modified
 * @param  {Item5e}   itemData   Source item
 */
async function bonusEffect (actorData, itemData) {
    const gameRound = game.combat ? game.combat.round : 0;
    const effectData = {
        label:  `${itemData.name} Bonus`,
        icon:   itemData.img,
        origin: lastArg.origin,
        duration: {
            turn: 1,
            startTround: gameRound,
            startTime: game.time.worldTime
        },
        changes: [
            {
                key:      "flags.midi-qol.optional.emboldeningBond.label",
                mode:     2,
                value:    `${itemData.name} Bonus`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.emboldeningBond.attack.all",
                mode:     2,
                value:    "+1d4",
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.emboldeningBond.check.all",
                mode:     2,
                value:    "+1d4",
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.emboldeningBond.skill.all",
                mode:     2,
                value:    "+1d4",
                priority: 20
            },
            {
                key:      "flags.midi-qol.optional.emboldeningBond.save.all",
                mode:     2,
                value:    "+1d4",
                priority: 20
            }
        ]
    };

    let getBond = await actorData.effects.find((effect) => {
        return effect.data.label === `${itemData.name} Bonus`;
    });

    if (!getBond) {
        await actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
}

/**
 * Handles adding the protective bond skill to target characters
 */
async function protectiveBond () {
    const bondPassive = await getItems({
        actorData: props.caster,
        itemLabel: "Protective Bond"
    });

    const expansiveBond = await getItems({
        actorData: props.caster,
        itemLabel: "Expansive Bond"
    });

    if (bondPassive.length > 0) {
        const itemData = {
                "name": "Protective Bond (Protect)",
                "type": "feat",
                "img": "worlds/assets/icons/features/class/cleric/protective-bond.png",
                "data": {
                "description": {
                    "value": "<p><a href=\"https://www.dndbeyond.com/classes/cleric#ProtectiveBond-2997262\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Protective Bond</a></p>\n<h3><strong>Summary</strong></h3>\n<p>The bond you forge between people helps them protect each other. When a creature affected by your Emboldening Bond feature is about to take damage, a second bonded creature within 30 feet of the first can use its reaction to teleport to an unoccupied space within 5 feet of the first creature. The second creature then takes all the damage instead.</p>\n<hr />\n<h3><strong>Foundry Usage</strong></h3>\n<ul>\n<li style=\"padding-top:3px;padding-bottom:3px\">Damage transfer should be handled manually</li>\n</ul>",
                    "chat": "",
                    "unidentified": ""
                },
                "source": "Tasha's Cauldron of Everything",
                "activation": {
                    "type": "reactionmanual",
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
                "actionType": "util",
                "attackBonus": 0,
                "chatFlavor": "",
                "critical": {
                    "threshold": null,
                    "damage": null
                },
                "damage": {
                    "parts": [],
                    "versatile": ""
                },
                "formula": "",
                "save": {
                    "ability": "",
                    "dc": null,
                    "scaling": "spell"
                },
                "requirements": "Peace Domain 6",
                "recharge": {
                    "value": null,
                    "charged": false
                },
                "attunement": null
                },
                "effects": [
                {
                    "_id": "MsxEe9RSiMmp5l0w",
                    "changes": [
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "acid",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "bludgeoning",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "cold",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "fire",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "force",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "lightning",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "necrotic",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "piercing",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "poison",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "psychic",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "radiant",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "slashing",
                        "priority": "20"
                    },
                    {
                        "key": "data.traits.di.value",
                        "mode": 2,
                        "value": "thunder",
                        "priority": "20"
                    }
                    ],
                    "disabled": false,
                    "duration": {
                    "startTime": null,
                    "seconds": 6,
                    "turns": 1
                    },
                    "icon": "worlds/assets/icons/features/class/cleric/protective-bond.png",
                    "label": "Protective Bond",
                    "origin": "Item.7hGu5GquX1Txyl9c",
                    "transfer": false,
                    "flags": {
                    "core": {
                        "statusId": ""
                    },
                    "dae": {
                        "stackable": "none",
                        "durationExpression": "",
                        "macroRepeat": "none",
                        "specialDuration": [
                        "isHit"
                        ],
                        "transfer": false
                    },
                    "dnd5e-helpers": {
                        "rest-effect": "Ignore"
                    },
                    "ActiveAuras": {
                        "isAura": false,
                        "aura": "None",
                        "radius": null,
                        "alignment": "",
                        "type": "",
                        "ignoreSelf": false,
                        "height": false,
                        "hidden": false,
                        "displayTemp": false,
                        "hostile": false,
                        "onlyOnce": false
                    }
                    },
                    "tint": null,
                    "selectedKey": [
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value",
                    "data.traits.di.value"
                    ]
                }
                ],
                "flags": {
                "core": {
                    "sourceId": "Item.0wYujESE3IJl9Tpk"
                },
                "cf": {
                    "id": "temp_n6dlcb1l66b",
                    "color": "#34568B"
                },
                "autoanimations": {
                    "version": 4,
                    "killAnim": false,
                    "animLevel": false,
                    "options": {
                    "ammo": false,
                    "menuType": "marker",
                    "variant": "01",
                    "enableCustom": false,
                    "repeat": null,
                    "delay": null,
                    "staticType": "target",
                    "scale": null,
                    "opacity": null,
                    "unbindAlpha": false,
                    "unbindVisibility": false,
                    "persistent": true
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
                    "animation": "circleofstars",
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
                "midi-qol": {
                    "effectActivation": false,
                    "onUseMacroName": "[postActiveEffects]ItemMacro"
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
                    "toggleEffect": false,
                    "selfEffect": false
                },
                "itemacro": {
                    "macro": {
                    "data": {
                        "_id": null,
                        "name": "Protective Bond (Protect)",
                        "type": "script",
                        "author": "gnhyuGQX8kU3wJk6",
                        "img": "icons/svg/dice-target.svg",
                        "scope": "global",
                        "command": "/* ==========================================================================\n    Macro:         Protective Bond\n    Source:        Custom\n    Usage:         ItemMacro\n   ========================================================================== */\n\n/* ==========================================================================\n    Macro Globals\n   ========================================================================== */\nconst lastArg   = args[args.length - 1];\nconst tokenData = canvas.tokens.get(lastArg?.tokenId) || {};\n\nconst props = {\n    name: \"Protective Bond\",\n    state: args[0]?.tag || args[0] || \"unknown\",\n\n    tokenData,\n\n    animationColor: \"blue\"\n};\n\nlogProps(props);\n\n\n/* ==========================================================================\n    Macro Logic\n   ========================================================================== */\n\n// Check dependencies ---------------------------------------------------------\nif (!(game.modules.get(\"warpgate\")?.active)) {\n    return ui.notifications.error(\"Warpgate is required!\");\n}\n\nif (!(game.modules.get(\"sequencer\")?.active)) {\n    return ui.notifications.error(\"Sequencer is required!\");\n}\n\n\n// Handle movement ------------------------------------------------------------\nconst range = await canvas.scene.createEmbeddedDocuments(\"MeasuredTemplate\", [{\n    t:           \"circle\",\n    user:        game.userId,\n    x:           props.tokenData.x + canvas.grid.size / 2,\n    y:           props.tokenData.y + canvas.grid.size / 2,\n    direction:   0,\n    distance:    30,\n    borderColor: \"#ff0000\"\n}]);\n\nconst position = await warpgate.crosshairs.show({\n    size:        1,\n    tag:         randomID(),\n    label:       \"Teleport to\",\n    drawOutline: false,\n    drawIcon:    false\n}, { show: async (crosshair) => {\n\n    new Sequence()\n        .effect()\n            .from(props.tokenData)\n            .attachTo(crosshair)\n            .persist()\n            .opacity(0.5)\n        .play();\n}});\n\nawait range[0].delete();\n\n\n// Teleport Handling ----------------------------------------------------------\nnew Sequence()\n    .effect()\n        .file(`jb2a.misty_step.01.${props.animationColor}`)\n        .atLocation(props.tokenData)\n        .randomRotation()\n        .scaleToObject(2)\n    .wait(750)\n    .animation()\n        .on(props.tokenData)\n        .opacity(0.0)\n        .waitUntilFinished()\n    .animation()\n        .on(props.tokenData)\n        .teleportTo(position)\n        .snapToGrid()\n        .waitUntilFinished()\n    .effect()\n        .file(`jb2a.misty_step.02.${props.animationColor}`)\n        .atLocation(props.tokenData)\n        .randomRotation()\n        .scaleToObject(2)\n    .wait(1500)\n    .animation()\n        .on(props.tokenData)\n        .opacity(1.0)\n    .play();\n\n\n/* ==========================================================================\n    Helpers\n   ========================================================================== */\n\n/**\n* Logs the global properties for the Macro to the console for debugging purposes\n*\n* @param  {Object}  props  Global properties\n*/\nfunction logProps (props) {\n    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");\n    Object.keys(props).forEach((key) => {\n        console.log(`${key}: `, props[key]);\n    });\n    console.groupEnd();\n}",
                        "folder": null,
                        "sort": 0,
                        "permission": {
                        "default": 0
                        },
                        "flags": {}
                    }
                    }
                },
                "exportSource": {
                    "world": "hard-knocks",
                    "system": "dnd5e",
                    "coreVersion": "9.269",
                    "systemVersion": "1.6.3"
                }
                }
        };

        if (expansiveBond.length > 0) {
            itemData.range.range = 60;
            itemData.itemacro.command = itemData.itemacro.command.replace("30", "60");
        }

        await props.actorData.createEmbeddedDocuments("Item", [itemData]);
    }
}

/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
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
