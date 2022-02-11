/* ==========================================================================
    Macro:              Feed on Death
    Description:        Handles the additional damage for the Crypt Keeper Glaive
    Source:             Custom
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Apply effect -----------------------------------------------------------
    if (props.state === "on") {
        const tempHP = await new Roll("1d10").roll({ async: true });

        // Apply temporary HP -------------------------------------------------
        const effectData = {
            label: "Feed on Death (Temp HP)",
            icon:  "icons/magic/unholy/hand-claw-fog-green.webp",
            disabled: false,
            duration: {
                rounds:     10,
                seconds:    60,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            changes: [{
                key:      "data.attributes.hp.temp",
                mode:     5,    // Override
                priority: 20,
                value:    `"${tempHP.total}"`
            }]
        };

        await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

        // Update weapon status -----------------------------------------------
        const weapon = await getItems(props.actorData, "Crypt Keeper Glaive");

        if (weapon) {
            const weaponCopy = duplicate(weapon[0]);
            const id         = weapon.id;

            weaponCopy.data.damage.parts.push([`${tempHP.total}`, "necrotic"]);
            props.actorData.updateEmbeddedDocuments("Item", [weaponCopy]);

            DAE.setFlag(props.actorData, props.daeFlag, {
                id,
                damage: weaponCopy.data.damage
            });
            ChatMessage.create({ content: weaponCopy.name + " begins to glow with a sickly green palor."});
        }

        // Lighting Effect ----------------------------------------------------
        const TokenUpdate = game.macros.getName("TokenUpdate");

        if (TokenUpdate) {
            TokenUpdate.execute(props.tokenID, {
                light: {
                    active: true,
                    dim:    5,
                    bright: 0,
                    angle:  360,
                    color:  "#8A9A5B",
                    animation: {
                        type:      "ghost",
                        speed:     3,
                        intensity: 5
                    }
                }
            });
        }
    }


    // Remove effect ----------------------------------------------------------
    if (props.state === "off") {

        // Remove weapon customization ----------------------------------------
        const weapon = await getItems(props.actorData, "Crypt Keeper Glaive");
        const flag   = DAE.getFlag(props.actorData, props.daeFlag);

        if (weapon && flag) {
            const weaponCopy  = duplicate(weapon[0]);
            flag.damage.parts.pop();

            weaponCopy.data.damage.parts = flag.damage.parts;
            props.actorData.updateEmbeddedDocuments("Item", [weaponCopy]);

            DAE.unsetFlag(props.actorData, props.daeFlag);
            ChatMessage.create({ content: weaponCopy.name + " returns to normal"});
        }

        // Lighting Effect ----------------------------------------------------
        const TokenUpdate = game.macros.getName("TokenUpdate");

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
 * Returns a collection of items that have the specified label
 *
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems (actorData, itemLabel = ``) {
    if (!actorData) {
        return null;
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
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
    console.warn(lastArg);

    return {
        name:  "Crypt Keeper Glaive",
        state: args[0] || "",

        actorData: canvas.tokens.get(lastArg.tokenId)?.actor || "",
        daeFlag:   "crypt-keeper-glaive",
        tokenID:   lastArg.tokenId
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
