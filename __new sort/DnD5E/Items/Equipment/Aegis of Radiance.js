/* ==========================================================================
    Macro:              Aegis of Radiance
    Description:        Applies lighting effect to character
    Source:             Custom
    Usage:              DAE ItemMacro #{hex-color-optional}
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    const TokenUpdate = game.macros.getName("TokenUpdate");

    if (!TokenUpdate) {
        return ui.notifications.error("TokenUpdate macro is required!");
    }

    // Apply lighting ---------------------------------------------------------
    if (props.state === "on") {
        TokenUpdate.execute(props.token, props.light);
        await toggleShield(props.actorData, false);
    }

    // Remove lighting --------------------------------------------------------
    if (props.state === "off") {
        TokenUpdate.execute(props.token, {
            light: {
                dim:    0,
                bright: 0
            }
        });
        await toggleShield(props.actorData, true);
    }

})();

/**
 * Parses the data of the passed in value and makes sure that it is a valid
 * color format
 */
function getColor (data) {

    if (typeof data === "string") {
        const matches = data.match(/#[0-9a-zA-Z]{1,6}/);

        if (matches !== null && matches.length > 0) {
            return data;
        }
    }

    return "#FDB813";
}

/**
 * Toggles the equiped state of the shield
 *
 * @param {Actor5e}  actor  Actor to be operated on
 * @param {boolean}  state  Equipped state of the shield
 */
async function toggleShield (actor, state) {
    const shield = await getItems({
        actorData: actor,
        itemLabel: "Aegis of Radiance"
    });
    const shieldCopy = duplicate(shield[0]);

    shieldCopy.data.equipped = state;

    actor.updateEmbeddedDocuments("Item", [shieldCopy]);
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


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg = args[args.length - 1];

    return {
        name:  "Aegis of Radiance",
        state: args[0],
        token: lastArg.tokenId,

        actorData: canvas.tokens.get(lastArg.tokenId).actor,

        light: {
            light: {
                active: true,
                dim:    40,
                bright: 20,
                angle:  360,
                alpha:  0.07,
                color:  getColor(args[1]),
                animation: {
                    type:      "sunburst",
                    speed:     2,
                    intensity: 3
                }
            }
        }
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
