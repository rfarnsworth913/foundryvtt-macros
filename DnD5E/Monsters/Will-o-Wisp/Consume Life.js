/* ==========================================================================
    Macro:              Consume Life
    Description:        Handles healing from the Consume Life ability
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


    // Check for failed target ------------------------------------------------
    if (props.target.length > 0) {
        let healingRoll = new Roll(props.healing).roll({ async: false });

        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            healingRoll.total,
            "healing",
            [token],
            healingRoll,
            {
                flavor: "Consume Life - Healing Roll (Healing)",
                itemCardId: props.itemCardID
            }
        );
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

    return {
        name:       "Consume Life",
        healing:    "3d6",
        itemCardID: lastArg.itemCardId || "",
        target:     lastArg.failedSaves || []
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
