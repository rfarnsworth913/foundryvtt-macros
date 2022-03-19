/* ==========================================================================
    Macro:              Acid Splash
    Description:        Animation for Acid Splash
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


    // Check for Sequencer ----------------------------------------------------
    if (!(game.modules.get("sequencer")?.active)) {
        return ui.notifications.error("Sequencer is required!");
    }


    // Get targets ------------------------------------------------------------
    let missed = false;

    if (props.targets.length === 0) {
        props.targets.push(props.missed[0]);
        missed = true;
    }


    // Handle animation -------------------------------------------------------
    new Sequence()
        .effect()
            .file("jb2a.fire_bolt.green")
            .atLocation(props.token)
            .stretchTo(props.targets[0])
            .missed(missed)
        .effect()
            .file("jb2a.liquid.splash.green")
            .atLocation(props.targets[1] ?? false)
            .scale(0.5)
            .delay(1000)
            .playIf(props.targets.length === 2)
        .play();
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
        name:    "Acid Splash",
        token:   canvas.tokens.get(lastArg.tokenId),

        missed:  lastArg.targets,
        targets: lastArg.failedSaves
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
