/* ==========================================================================
    Macro:              Quick Fingers
    Description:        Handles making the check for Quick Fingers
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


    // Check for targets ------------------------------------------------------
    if (props.target === "") {
        return ui.notifications.error("No target selected!");
    }


    // Perform check ----------------------------------------------------------
    const dc    = props.target.actor.data.data.skills.prc.passive + 1;
    await props.actor.rollSkill("slt", {
        flavor: `Quick Fingers ${CONFIG.DND5E.skills["prc"]} DC: ${dc}`
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
    console.warn(lastArg);

    return {
        name: "Quick Fingers",

        actor:  canvas.tokens.get(lastArg.tokenId)?.actor || "",
        target: lastArg.targets[0] || ""
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
