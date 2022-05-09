/* ==========================================================================
    Macro:              Petrified
    Description:        Handles animations for the Petrified Effect
    Source:             Custom
    Usage:              DAE macro.execute  Petrified
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
                .scaleToObject(1.5)
                .opacity(0.75)
                .persist()
                .name(props.label)
                .fadeIn(300)
                .fadeOut(300)
            .play();

        // Apply Stone Tint ---------------------------------------------------
        const tokenUpdate = game.macros.getName("TokenUpdate");

        if (tokenUpdate) {
            tokenUpdate.execute(props.token.id, {
                tint: "#888C8D"
            });
        }
    }


    // Remove Animation -------------------------------------------------------
    if (props.state === "off") {
        Sequencer.EffectManager.endEffects({
            name:   props.label,
            object: props.token
        });

        // Remove Stone Tint --------------------------------------------------
        const tokenUpdate = game.macros.getName("TokenUpdate");

        if (tokenUpdate) {
            tokenUpdate.execute(props.token.id, {
                tint: null
            });
        }
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
        name:  "Petrified",
        state: args[0] || "",

        animation: "jb2a.ground_cracks.03.orange",
        label:     `Petrified-${lastArg.tokenId}`,
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
