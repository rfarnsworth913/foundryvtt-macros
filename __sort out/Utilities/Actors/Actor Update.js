/* ==========================================================================
    Macro:              Actor Update
    Description:        Applies update to the actor object
    Source:             https://github.com/kandashi/Macros/blob/master/Callback%20Macros/ActorUpdate.js
    Usage:              const ActorUpdate = game.macros.getName("ActorUpdate");
                        ActorUpdate.execute(actor.id, { updates });
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, this.name);

    if (!validateProps(props)) {
        return;
    }

    await canvas.tokens.get(props.actorID).document.actor.update(props.updateData);

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
        actorID:    args[0],
        updateData: args[1]
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
