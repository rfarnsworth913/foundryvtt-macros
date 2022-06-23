/* ==========================================================================
    Macro:              Potion of Vitality
    Description:        Handles removing effects from the target
    Source:             Custom
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check for dependencies -------------------------------------------------
    if (!(game.modules.get("dfreds-convenient-effects")?.active)) {
        return ui.notifications.error("dfreds-convenient-effects is required!");
    }

    // Remove conditions ------------------------------------------------------
    props.conditions.forEach((condition) => {
        const hasEffect = game.dfreds.effectInterface.hasEffectApplied(condition, props.uuid);

        if (hasEffect) {
            game.dfreds.effectInterface.removeEffect({
                effectName: condition,
                uuid: props.uuid
            });
        }
    });

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
        name:  "Potion of Vitality",
        state: args[0] || "",

        actorData: tokenData.actor || {},
        tokenData,
        uuid: tokenData.actor.uuid,

        conditions: [
            "Exhaustion 1",
            "Exhaustion 2",
            "Exhaustion 3",
            "Exhaustion 4",
            "Exhaustion 5",
            "Poisoned",
            "Diseased"
        ]
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
