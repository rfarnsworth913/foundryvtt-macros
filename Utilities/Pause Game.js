/* ==========================================================================
    Macro:              Pause Game
    Description:        Logic to pause, resume or toggle the pause state of the client(s)
    Source:             Custom
    Usage:              const pause = game.macros.getName("PauseGame");
                        pause.execute({{ state: pause | resume | toggle }})
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    switch (props.state) {
        case "resume":
            game.togglePause(false, true);
            break;

        case "toggle":
            game.togglePause(!game.paused, true);
            break;

        default:
            game.togglePause(true, true);
            break;
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
        name: "Pause Game",
        state: args[0] || "pause"
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
