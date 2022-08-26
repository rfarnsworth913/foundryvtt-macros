/* ==========================================================================
    Macro:              Heat-Draining Aura
    Description:        Handles the healing aspect of the Heat Draining Aura
    Source:             Custom
    Usage:              ItemMacro  After Damage Roll
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Apply healing to self --------------------------------------------------
    const healing = props.targets * 5;

    if (healing > 0) {
        const damageRoll = new Roll(`${healing}`).roll();
        const target     = await fromUuid(props.uuid);

        new MidiQOL.DamageOnlyWorkflow(actor, token, damageRoll.total, "healing", [target], damageRoll, { flavor: "Heat-Draining Aura (Healing)" });
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
    return {
        name:    "Heat-Draining Aura",
        targets: args[0].targets.length || 0,
        uuid:    args[0].tokenUuid
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
