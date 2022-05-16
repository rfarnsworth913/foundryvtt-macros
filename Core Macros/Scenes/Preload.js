/* ==========================================================================
    Macro:              Preload
    Description:        Handles preloading a specified set of scenes
    Source:             Custom
    Usage:              Preload [{{ scene names }}]
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Check for scenes -------------------------------------------------------
    if (props.scenes.length === 0) {
        return ui.notifications.error("No scenes specified!");
    }


    // Preload Handler --------------------------------------------------------
    props.scenes.forEach((sceneName) => {
        const scene = game.scenes.getName(sceneName)?.id;
        game.scenes.preload(scene, true);
    });

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
        name:   "Preload",
        scenes: Array.from(args) || []
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
