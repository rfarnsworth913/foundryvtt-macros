/* ==========================================================================
    Macro:              Simple Trap
    Description:        Handles Simple Traps
    Source:             https://gitlab.com/tposney/midi-qol
    Usage:              Callback {{ Actor Name }} {{ Item / Trap Name }}
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Validate we have the trap information ----------------------------------
    if (!props.trap.actor) {
        return console.error(`Cannot find actor: ${args[0]}`);
    }

    if (!props.trap.item) {
        return console.error(`Cannot find item: ${args[1]}`);
    }


    // Apply damage to target -------------------------------------------------
    const templateLocation = props.trap.token?.center;

    new MidiQOL.TrapWorkflow(props.trap.actor, props.trap.item, [token], templateLocation);
    if (props.trap.token) {
        await props.trap.token.update({ hidden: false });
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
    const args      = Array.from(arguments);
    const trapActor = game.actors.getName(args[0]) || "";

    return {
        name: "Animated Trap",
        trap: {
            actor: trapActor,
            item:  trapActor.items.getName(args[1]) || "",
            token: Tagger.getByTag(args[2])[0]
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
