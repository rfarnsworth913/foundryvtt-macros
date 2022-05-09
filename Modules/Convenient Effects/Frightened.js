/* ==========================================================================
    Macro:              Frightened
    Description:        Handles animations for the Frightened Effect
    Source:             Custom
    Usage:              DAE macro.execute  Frightened
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check dependencies -----------------------------------------------------
    if (!(game.modules.get("sequencer")?.active)) {
        return {};
    }


    // Apply Animation --------------------------------------------------------
    if (props.state === "on") {
        new Sequence()
            .effect()
                .file(props.animation)
                .attachTo(props.token)
                .scale(0.5)
                .persist()
                .name(props.label)
                .fadeIn(300)
                .fadeOut(300)
            .play();
    }


    // Remove Animation -------------------------------------------------------
    if (props.state === "off") {
        Sequencer.EffectManager.endEffects({
            name:   props.label,
            object: props.token
        });
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
        name:  "Frightened",
        state: args[0] || "",

        animation: "jb2a.markers.horror.purple.02",
        label:     `Frightened-${lastArg.tokenId}`,
        token:     canvas.tokens.get(lastArg.tokenId)
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
