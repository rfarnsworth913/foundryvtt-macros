/* ==========================================================================
    Macro:              Spike Growth
    Description:        Handles applying damage from Spike Growth
    Source:             Active Effects
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return false;
    }

    // Check for dependencies -------------------------------------------------
    if (!(game.modules.get("advanced-macros")?.active)) {
        return ui.notifications.error("Advanced Macros is required!");
    }

    // Handle On Use ----------------------------------------------------------
    if (props.state === "OnUse") {
        AAhelpers.applyTemplate(props.args);
    }

    // Handle DAE Status ------------------------------------------------------
    if (props.state === "on" || props.state === "each") {

        const damageRoll = await new Roll("2d4[piercing]").evaluate();
        await damageRoll.toMessage({ flavor: "Spike Growth Damage" });

        const targets = new Set();
        const saves   = new Set();

        targets.add(props.tokenData);
        saves.add(props.tokenData);

        await MidiQOL.applyTokenDamage(
            [{
                damage: damageRoll.total,
                type:   "piercing"
            }],
            damageRoll.total,
            targets,
            null,
            saves
        );

        const effect = props.actorData.effects.find((item) => {
            return item.data.label === "Spike Growth";
        });
        await effect.delete();
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
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  "Spike Growth",
        state: args[0]?.tag || args[0] || "",

        actorData: tokenData.actor || {},
        tokenData,

        args
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
