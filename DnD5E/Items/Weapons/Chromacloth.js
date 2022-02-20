/* ==========================================================================
    Macro:              Chromacloth
    Description:        Handles removing resistance effects when used to attack
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


    // Check for actor --------------------------------------------------------
    if (props.actorData === "") {
        return {};
    }


    // Disabled effects -------------------------------------------------------
    props.effects.forEach((effectLabel) => {
        let effect = props.actorData.effects.find((effect) => {
            return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
        });

        if (effect) {
            effect.update({ disabled: true });
        }
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
    const lastArg = args[args.length - 1];

    return {
        name:  "Chromacloth",
        actorData: lastArg.actor || "",
        effects: [
            "Chromacloth (Red)",
            "Chromacloth (Yellow)",
            "Chromacloth (Green)",
            "Chromacloth (Blue)"
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
