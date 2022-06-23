/* ==========================================================================
    Macro:              Sleep
    Description:        Handles animations for the Sleep Effect
    Source:             Custom
    Usage:              DAE macro.execute  Sleep
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
                .file("jb2a.sleep.target.blue")
                .attachTo(props.token)
                .scale(0.5)
                .fadeIn(300)
                .fadeOut(300)
            .effect()
                .delay(6500)
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

        const cubMacro = game.macros.getName("CUBCondition");

        if (cubMacro) {
            await wait(500);
            cubMacro.execute(props.token.id, ["Prone"], "add");
        }
    }

})();

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}


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
        name:  "Sleep",
        state: args[0] || "",

        animation: "jb2a.sleep.symbol.blue",
        label:     `Sleep-${lastArg.tokenId}`,
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
