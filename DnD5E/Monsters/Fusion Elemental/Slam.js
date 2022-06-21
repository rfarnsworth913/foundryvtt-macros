/* ==========================================================================
    Macro:              Slam
    Description:        Fusion Elemental Slam
    Source:             Custom
    Usage:              OnUse
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return false;
    }

    if (props.state === "OnUse" && props.pass === "preDamageRoll") {
        const randomElement = props.damageTypes[Math.floor(Math.random() * props.damageTypes.length)];
        await props.item.data.data.damage.parts.push(["2d8", randomElement]);
    }

    if (props.state === "OnUse" && props.pass === "postActiveEffects") {
        await props.item.data.data.damage.parts.pop();
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
        name:  "Slam",
        state: args[0].tag || "",
        pass:  args[0].macroPass || "",

        damageTypes: ["acid", "cold", "fire", "lightning"],
        item:        lastArg.actor.items.get(lastArg.item._id),
        workflowID:  args[0].uuid || ""
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
    const missingProps = [];

    Object.keys(props).forEach((key) => {
        if (!props[key] || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
