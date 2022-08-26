/* ==========================================================================
    Macro:              Split
    Description:        Handles splitting a source creature into two creatures
    Source:             Custom
    Usage:              DAE ItemMacro {{ Token to Summon Name}}
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Check source creature size to see if we can do split -------------------
    const size = props.tokenDocument.actor.data.data.traits.size || "";
    const hp   = props.tokenDocument.actor.data.data.attributes.hp.value || 0;

    if ((size !== "lg" || size !== "med") && hp < 10) {
        return ui.notifications.error("Creature cannot split!");
    }


    // Determine mutations ----------------------------------------------------
    const newSize = size === "lg" ? "med" : "sm";
    const updates = {
        token: {
            height: props.size[newSize],
            width:  props.size[newSize]
        },
        actor: {
            data: {
                attributes: {
                    hp: { value: parseInt(hp / 2) }
                },
                traits: {
                    size: newSize
                }
            }
        }
    };


    // Mutate and Spawn Creatures ---------------------------------------------
    await warpgate.mutate(props.tokenDocument, updates);
    await warpgate.spawn(props.creatureName, updates);

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
        name:          "Split",
        creatureName:  lastArg.actor.name,
        tokenDocument: lastArg.targets[0],

        size: {
            sm:  1,
            med: 1,
            lg:  2
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
