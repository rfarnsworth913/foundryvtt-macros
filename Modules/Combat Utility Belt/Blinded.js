/* ==========================================================================
    Macro:              Blinded
    Description:        Applies blinded changes to token
    Source:             Custom
    Usage:              DAE Macro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check dependencies -----------------------------------------------------
    if (!(game.modules.get("perfect-vision")?.active)) {
        return {};
    }


    // Apply Blinded Condition ------------------------------------------------
    if (props.state === "on") {

        // Check if actor has any special senses that would overcome the blind status
        const senses = props.actor.data.data.attributes.senses;
        const vision = ["Blindfighting"];

        if (senses.blindsight > 0 || vision.some((sense) => {
            return senses.special.includes(sense);
        })) {
            return {};
        }

        // Set tracking flag and limit token sight
        DAE.setFlag(props.token, "blinded", {
            state: true
        });

        props.token.document.setFlag("perfect-vision", "sightLimit", 5);
    }


    // Remove Blinded Condition -----------------------------------------------
    if (props.state === "off") {
        const flag = DAE.getFlag(props.token, "blinded");

        if (flag) {
            props.token.document.unsetFlag("perfect-vision", "sightLimit");
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
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId);

    return {
        name: "Blinded",
        state: args[0] || "",

        actor: tokenData.actor,
        token: tokenData
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
