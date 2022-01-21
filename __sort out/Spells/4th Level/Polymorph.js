/* ==========================================================================
    Macro:              Polymorph
    Description:        Handles the process of polymorphing a specified token
    Source:             Custom
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Apply Polymorph --------------------------------------------------------
    if (props.state === "on") {
        const target = game.actors.get("Maonl2ljKVWV0vsO");
        await props.actor.transformInto(target, {
            keepPhysical:false, keepMental:false, keepSaves:false, keepSkills:false,
    mergeSaves:false, mergeSkills:false, keepClass:false, keepFeats:false, keepSpells:false,
    keepItems:false, keepBio:false, keepVision:false, transformTokens:true
        });
    }


    // Remove Polymorph -------------------------------------------------------
    if (props.state === "off") {
        await props.actor.revertOriginalForm();
    }

    // Test basic conversion and reversion
    // Get correct configuration options
    // Get Folder Information
    // Generate Dialog Content
    // Create Dialog Box
    // Finalize transformation process
    // Final testing

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

    return {
        name:   "Polymorph",
        folder: "Polymorph",
        state:  args[0] || "",
        actor:  game.actors.get(lastArg.actorId),
        token:  canvas.tokens.get(lastArg.tokenId)
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
