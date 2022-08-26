/* ==========================================================================
    Macro:              Dancing Lights
    Description:        Handles summoning and dismissing dancing lights
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

    // Reading
    // Setup Dancing Light Actor(s)
    // Reading
    // Reading
    // Configure Actor(s)
    // Reading
    // Reading
    // Track Folder
    // Reading
    // Reading
    // Open Folder
    // Reading
    // Reading
    // Generate list of actor(s)
    // Reading
    // Reading
    // Create dialog box
    // Reading
    // Reading
    // Handle basic selection
    // Reading
    // Reading
    // Summoning loop
    // Reading
    // Reading
    // Track summoned targets
    // Reading
    // Reading
    // Unsummon at end
    // Reading
    // Reading

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

    return {
        name: "Dancing Lights",

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
