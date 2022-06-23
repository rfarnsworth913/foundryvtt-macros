/* ==========================================================================
    Macro:              Darkvision
    Description:        Plays animation for setting Darkvision
    Source:             Custom
    Usage:              DAE ItemMacro
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
        return ui.notifications.error("Sequencer is required!");
    }


    // Animation --------------------------------------------------------------
    new Sequence()
        .effect()
            .file("jb2a.magic_signs.circle.02.transmutation.intro.purple")
            .scaleToObject(1.75)
            .atLocation(props.tokenData)
            .belowTokens()
            .waitUntilFinished(-500)
        .effect()
            .file("jb2a.magic_signs.circle.02.transmutation.loop.purple")
            .scaleToObject(1.75)
            .atLocation(props.tokenData)
            .belowTokens()
            .fadeIn(200)
            .fadeOut(200)
            .waitUntilFinished(-550)
        .effect()
            .file("jb2a.magic_signs.circle.02.transmutation.outro.purple")
            .scaleToObject(1.75)
            .atLocation(props.tokenData)
            .belowTokens()
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
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  `Darkvision`,
        state: args[0] || ``,

        tokenData
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
