/* ==========================================================================
    Macro:              Combat Utility Belt Conditions
    Description:        Handles toggling conditions with Combat Utility Belt
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/Callback%20Macros/Cub_Condition.js
    Usage:              let CUBCondition = game.macros.getName("CUBCondition");
                        CUBCondition.execute(targetID, "Condition", "add|remove");   Single Condition

                        let conditions = ["condition 1","condition 2","condition 3"];
                        CUBCondition.execute(targetID, conditions, "add|remove");    Multiple Conditions
  ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, this.name);

    if (!validateProps(props)) {
        return;
    }

    // Add or remove conditions from the specified token
    if (props.state === "remove") {
        await game.cub.removeCondition(props.conditions, props.target, { warn: false });
    }

    if (props.state === "add") {
        await game.cub.addCondition(props.conditions, props.target, { warn: false });
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
    return {
        target:     canvas.tokens.get(args[0]),
        conditions: args[1],
        state:      args[2]
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
