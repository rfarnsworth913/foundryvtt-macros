/* ==========================================================================
    Macro:              Goggles of Night
    Description:        Handles updating a user's Darkvision based upon existing values
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


    // Apply darkvision updates -----------------------------------------------
    if (props.state === "on") {
        // Get current darkvision settings from token (dimvision)
        // Store original value as a flag on character
        // Update existing value
    }


    // Remove darkvision updates ----------------------------------------------
    if (props.state === "off") {
        // Get value from flag
        // Restore original value
        // Delete temp flag
    }


})();


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
        name:  "Goggles of Night",
        state: args[0] || ""
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
