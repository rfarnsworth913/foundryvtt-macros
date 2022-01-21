/* ==========================================================================
    Macro:              Guiding Bolt
    Description:        Handles removing Sequencer Animations when Guiding Bolt is removed
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


    // Validate dependencies --------------------------------------------------
    if (!game.modules.get("sequencer")) {
        return ui.notifications.warn("Sequencer is not available!");
    }


    // Remove effect(s) -------------------------------------------------------
    if (props.state === "on") {
        await Sequencer.Helpers.wait(5000);

        new Sequence()
            .effect()
                .file("jb2a.markers.01.dark_bluewhite")
                .attachTo(props.tokenID)
                .scale(0.5)
                .belowTokens(true)
                .persist()
                .name(`Guiding-Bolt-${props.tokenID}`)
                .fadeIn(300)
                .fadeOut(300)
            .play();
    }

    if (props.state === "off") {
        Sequencer.EffectManager.endEffects({
            name:   `Guiding-Bolt-${props.tokenID}`
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
    console.warn(lastArg);

    return {
        name:    "Guiding Bolt",
        state:   args[0],
        tokenID: lastArg.tokenId || ""
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
