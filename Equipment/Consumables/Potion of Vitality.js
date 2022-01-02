/* ==========================================================================
    Macro:              Potion of Vitality
    Description:        Controls effects of the Potion of Vitality
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

    game.macros.getName("CUBCondition");
    CUBCondition.execute(props.target, props.conditions, "remove");
})();


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    return {
        name:   "Potion of Vitality",
        target: args[0].targets[0],
        conditions: [
            "Exhaustion 1",
            "Exhaustion 2",
            "Exhaustion 3",
            "Exhaustion 4",
            "Exhaustion 5",
            "Poisoned",
            "Diseased"
        ]
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
