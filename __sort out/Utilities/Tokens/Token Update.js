/* ==========================================================================
    Macro:              Token Update
    Description:        Handles applying updates to a specified token
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/Callback%20Macros/TokenUpdate.js
    Usage:              const TokenUpdate = game.macros.getName("TokenUpdate");
                        TokenUpdate.execute(target.id, { XYZ }, "on | off" (optional));
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, this.name);

    if (!validateProps(props)) {
        return;
    }

    await canvas.tokens.get(props.tokenID).document.update(props.data, { animate: props.animate });

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
        tokenID: args[0],
        data:    args[1],
        animate: args[2] || false
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
