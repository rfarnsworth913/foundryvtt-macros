/* ==========================================================================
    Macro:              Bane
    Description:        Handles removal of Bane Animation when target succeeds their save
    Source:             Custom
    Usage:              ItemMacro  After Active Effects
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


    // Remove effect for any save target(s) -----------------------------------
    await wait (7000);
    props.targets.forEach((target) => {
        Sequencer.EffectManager.endEffects({
            object:  target.id,
            origins: props.id
        });
    });

})();

async function wait(ms) {
    return new Promise(resolve => { setTimeout(resolve, ms); });
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
        name:    "Bane",
        targets: lastArg.saves,
        id:      lastArg.uuid
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
