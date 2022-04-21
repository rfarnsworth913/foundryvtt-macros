/* ==========================================================================
    Macro:              Candle
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

    // Apply lighting ---------------------------------------------------------
    if (props.state === "on") {
        TokenUpdate.execute(props.token, props.light);
    }

    // Remove lighting --------------------------------------------------------
    if (props.state === "off") {
       TokenUpdate.execute(props.token, {
           light: {
               dim:    0,
               bright: 0
           }
       });
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

    return "#F73718";
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg = args[args.length  - 1];

    return {
        name:  "Candle",
        state: args[0],
        token: lastArg.tokenId,
        light: {
            light: {
                active: true,
                dim:    10,
                bright: 5,
                angle:  360,
                alpha:  0.07,
                color:  getColor(args[1]),
                animation: {
                    type:      "torch",
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
