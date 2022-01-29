/* ==========================================================================
    Macro:              Summon
    Description:        Generic Summoning Macro
    Source:             Custom
    Usage:              DAE ItemMacro {{ Token Name }} @item
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check dependencies -----------------------------------------------------
    if (!(game.modules.get("warpgate")?.active)) {
        return ui.notifications.error("Warpgate is required!");
    }


    // Handle summoning -------------------------------------------------------
    if (props.state === "on") {

        // Summoning Handler --------------------------------------------------
        const updates = {};

        const target = await warpgate.spawn(props.summonToken, updates);
        await props.actor.setFlag("midi-qol", props.summonLabel, target[0]);
    }


    // Unsummon Token ---------------------------------------------------------
    if (props.state === "off") {

        const target = await props.actor.getFlag("midi-qol", props.summonLabel);

        if (target) {
            await warpgate.dismiss(target, game.scenes.current.data.document.id);
            await props.actor.unsetFlag("midi-qol", props.summonLabel);
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
        name: "Summon",
        state: args[0] || "",
        item:  args[2] || {},

        lastArg,

        actor:       tokenData?.actor || {},
        duration:    3600,
        summonLabel: `${args[2]?.name.replace(" ", "_")}_Summoned_Token`,
        summonToken: args[1] || ""
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
