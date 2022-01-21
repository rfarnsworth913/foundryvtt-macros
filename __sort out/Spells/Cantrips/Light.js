/* ==========================================================================
    Macro:              Light
    Description:        Handler for Light Spell
    Source:             Custom
    Usage:              DAE {{ optional: hex color code }}
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {

    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Handle applying light --------------------------------------------------
    if (props.state === "on") {
        await props.target.document.update(props.lightingEffect);
    }

    // Handle removing light --------------------------------------------------
    if (props.state === "off") {
        await props.target.document.update({
            dimLight:    0,
            brightLight: 0
        });
    }
})();

/**
 * Parses the data of the passed in value and makes sure that it is a valid
 * color format
 */
function getColor (data) {
    if (typeof data === "string" && data.match(/#[0-9a-zA-Z]{1,6}/).length > 0) {
        return data;
    } else {
        return "#FDF4DC";
    }
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
    const color   = getColor(args[1]);

    return {
        name:   "Light",
        state:  args[0] || "unknown",
        target: canvas.tokens.get(lastArg.tokenId),

        lightingEffect: {
            dimLight:    40,
            brightLight: 20,
            lightAngle:  360,
            lightAlpha:  0.07,
            lightColor:  color,
            lightAnimation: {
                type:      "pulse",
                speed:     1,
                intensity: 2
            }
        }
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
