/* ==========================================================================
    Macro:              Produce Flame
    Description:        Handles creating and removing the flame object
    Source:             https://www.patreon.com/posts/produce-flame-51998583
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    const TokenUpdate = game.macros.getName("TokenUpdate");

    // Handle applying effect -------------------------------------------------
    if (props.state === "on") {

        // Create item and add to character -----------------------------------
        const itemData = [{
            "name": props.label,
            "type": "spell",
            "img":  "systems/dnd5e/icons/spells/explosion-orange-2.jpg",
            "data": {
                "description": {
                    "value": "<p>You can hurl the flame at a creature within 30 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 fire damage.</p><p>This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).</p>"
                },
                "activation": {
                    "type": "action",
                    "cost": 1
                },
                "target": {
                    "value": 1,
                    "type":  "creature"
                },
                "range": {
                    "value": 30,
                    "units": "ft"
                },
                "actionType": "rsak",
                "damage": {
                    "parts": [
                        ["1d8", "fire"]
                    ],
                    "versatile": ""
                },
                "save": {
                    "scaling": "spell"
                },
                "level": 0,
                "school": "con",
                "components": {
                    "vocal": true,
                    "somatic": true
                },
                "preparation": {
                    "mode": "innate",
                    "prepared": true
                },
                "scaling": {
                    "mode": "cantrip",
                    "formula": "1d8"
                }
            },
            "effects": [],
            "flags": {
                "midi-qol": {
                    "onUseMacroName":    "[all]ItemMacro",
                    "criticalThreshold": "20",
                    "effectActivation":  false
                },
                "itemacro": {
                    "macro": {
                        "data": {
                            "_id": null,
                            "name": props.label,
                            "type": "script",
                            "author": "Tyd5yiqWrRZMvG30",
                            "img": "icons/svg/dice-target.svg",
                            "scope": "global",
                            "command": "const lastArg = args[args.length - 1];\nlet tokenD = canvas.tokens.get(lastArg.tokenId);\nlet actorD = tokenD.actor;\nlet hit = lastArg.hitTargets.length > 0 ? true : false;\nlet target = hit ? canvas.tokens.get(lastArg.hitTargets[0].id) : canvas.tokens.get(lastArg.targets[0].id);\nlet effect = actorD.effects.find(i => i.data.label === \"Produce Flame\");\n\nif((!hit) && (lastArg.macroPass === \"postAttackRoll\")){    \n    if (effect) await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: actorD.uuid, effects: [effect.id] });\n    await anime(tokenD, target, hit);\n}\nif ((hit) && (lastArg.macroPass === \"preActiveEffects\")){    \n    if (effect) await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: actorD.uuid, effects: [effect.id] });\n    await anime(tokenD, target, hit);\n}\n\nasync function anime(tokenD, target, hit){\nif (!(game.modules.get(\"jb2a_patreon\")?.active || game.modules.get(\"JB2A_DnD5e\")?.active)) return {};\nif (!(game.modules.get(\"sequencer\")?.active)) return {};\nnew Sequence()\n    .effect()\n    .atLocation(tokenD)\n    .reachTowards(target)\n    .file(\"jb2a.fire_bolt.orange\")\n    .missed(!hit)\n    .waitUntilFinished(-500)\n.play()\n}",
                            "folder": null,
                            "sort": 0,
                            "permission": {
                                "default": 0
                            },
                            "flags": {}
                        }
                    }
                }
            }
        }];

        await props.actorData.createEmbeddedDocuments("Item", itemData);
        ui.notifications.warn(`Created At-Will Spell named ${props.label} in your favorites.`);


        // Apply lighting effect ----------------------------------------------
        if (TokenUpdate) {
            const lighting = {
                light: {
                    active: true,
                    dim:    20,
                    bright: 10,
                    angle:  360,
                    alpha:  0.07,
                    color:  "#F73718",
                    animation: {
                        type:      "torch",
                        speed:     2,
                        intensity: 3
                    }
                }
            };

            TokenUpdate.execute(props.tokenID, lighting);
        }
    }


    // Handle removing effect -------------------------------------------------
    if (props.state === "off") {
        await removeItem(props.actorData, props.label);

        if (TokenUpdate) {
            TokenUpdate.execute(props.tokenID, {
                light: {
                    active: false,
                    dim:    0,
                    bright: 0
                }
            });
        }
    }
})();


/**
 * Finds and removes an item from the specified actor's inventory
 *
 * @param    {Actor5e}  actorData  Actor to be operated on
 * @param    {String}   itemLabel  Item name to be removed from inventory
 * @returns  {Promise}             Removal handler
 */
async function removeItem (actorData, itemLabel) {
    let getItem = actorData.items.find((item) => {
        return item.name === itemLabel;
    });

    if(!getItem) {
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
    const itemData = lastArg.efData.flags.dae.itemData;

    return {
        name:  "Produce Flame",
        state: args[0],

        actorData: lastArg.tokenId ? canvas.tokens.get(lastArg.tokenId).actor :
                                     game.actors.get(lastArg.tokenId),
        itemData,
        label:   `Flame (${itemData.name})`,
        target:  canvas.tokens.get(lastArg.tokenId),
        tokenID: lastArg.tokenId
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
    let missingProps = [];

    Object.keys(props).forEach((key) => {
        if (props[key] === undefined || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
