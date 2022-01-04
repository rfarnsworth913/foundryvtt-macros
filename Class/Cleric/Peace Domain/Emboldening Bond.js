/* ==========================================================================
    Macro:              Emboldening Bond
    Description:        Handles logic regarding Emboldening Bond
    Source:             Custom
    Usage:              ItemMacro @target
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Handle initial application of the Emboldening State
    if (props.state === "on") {
        await props.actor.createEmbeddedDocuments("ActiveEffect", [props.effectData]);
    }

    // Handle checking each turn for application
    if (props.state === "each" || props.state === "off") {
        if (!getEmboldeningState(props)) {
            await props.actor.createEmbeddedDocuments("ActiveEffect", [props.effectData]);
        }
    }


})();

/**
 * Checks if the Emboldening Bond Dice Handler is present, and returns the current state
 *
 * @param    props  Macro global properties
 * @returns         If dice handler is present
 */
function getEmboldeningState (props) {
    let exists = false;

    // Lookup Emboldening Bond
    props.actor?.effects.forEach((value, key, map) => {
        if (value?.data?.label === props.effectData.label) {
            exists = true;
        }
    });

    return exists;
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const target  = canvas.tokens.get(args[1]) || {};
    const lastArg = args[args.length -1];

    return {
        name:  "Emboldening Bond",
        state: args[0],
        actor: target?.actor || {},
        token: target,

        effectData: {
            changes: [
                {
                    key:      "flags.midi-qol.optional.Name.save",
                    mode:     0,
                    priority: 20,
                    value:    "+1d4"
                },
                {
                    key:      "flags.midi-qol.optional.Name.check",
                    mode:     0,
                    priority: 20,
                    value:    "+1d4"
                },
                {
                    key:      "flags.midi-qol.optional.Name.attack",
                    mode:     0,
                    priority: 20,
                    value:    "+1d4"
                },
                {
                    key:      "flags.midi-qol.optional.Name.label",
                    mode:     0,
                    priority: 20,
                    value:    lastArg?.efData?.label
                }
            ],
            origin:   lastArg?.efData?.origin,
            disabled: false,
            duration: {
                rounds:     lastArg?.efData?.duration?.rounds,
                seconds:    lastArg?.efData?.duration?.seconds,
                startRound: lastArg?.efData?.duration?.startRound,
                startTime:  lastArg?.efData?.duration?.startTime
            },
            icon:  lastArg?.efData?.icon,
            label: lastArg?.efData?.label + " Dice Handler"
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
