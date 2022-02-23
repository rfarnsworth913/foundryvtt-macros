/* ==========================================================================
    Macro:              Dagger of the Ogre Mage
    Description:        Updates damage type of the weapon
    Source:             Custom
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Apply damage type change -----------------------------------------------
    if (props.state === "on") {
        new Dialog({
            title: `Choose damage type`,
            content: `
                <div class="form-group">
                    <label>Damage Type: </label>
                    <select id="damageType">
                        <option value="Acid">Acid</option>
                        <option value="Bludgeoning">Bludgeoning</option>
                        <option value="Cold">Cold</option>
                        <option value="Fire">Fire</option>
                        <option value="Force">Force</option>
                        <option value="Lightning">Lightning</option>
                        <option value="Necrotic">Necrotic</option>
                        <option value="Poison">Poison</option>
                        <option value="Psychic">Psychic</option>
                        <option value="Radiant">Radiant</option>
                        <option value="Slashing">Slashing</option>
                        <option value="Thunder">Thunder</option>
                    </select>
                </div>
            `,
            buttons: {
                ok: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: `Ok`,
                    callback: async (html) => {
                        let damageType = html.find(`#damageType`).val()?.toLowerCase();
                        let weapon     = await getItems({
                            actorData: props.actorData,
                            itemLabel: `Dagger of the Ogre Mage`
                        });

                        console.warn(damageType, weapon);

                        if (weapon && damageType) {
                            let weaponCopy = duplicate(weapon[0]);
                            weaponCopy.data.damage.parts[0][1] = damageType.toLowerCase();

                            props.actorData.updateEmbeddedDocuments(`Item`, [weaponCopy]);
                            ChatMessage.create({
                                content: `${weaponCopy.name} damage type is now ${damageType}.`
                            });
                        }
                    }
                },

                cancel: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: `Cancel`
                }
            }
        }).render(true);
    }


    // Remove damage type change ----------------------------------------------
    if (props.state === "off") {
        let weapon = await getItems({
            actorData: props.actorData,
            itemLabel: `Dagger of the Ogre Mage`
        });

        if (weapon) {
            let weaponCopy = duplicate(weapon[0]);
            weaponCopy.data.damage.parts[0][1] = `piercing`;

            props.actorData.updateEmbeddedDocuments(`Item`, [weaponCopy]);
            ChatMessage.create({
                content: `${weaponCopy.name} has returned to normal.`
            });
        }
    }

})();


/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = ``} = {}) {
    if (!actorData) {
        return console.error(`No actor specified`);
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase() &&
               item.type === "weapon";
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
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  `Dagger of the Ogre Mage`,
        state: args[0] || ``,

        actorData: tokenData.actor || {},
        tokenData,

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
