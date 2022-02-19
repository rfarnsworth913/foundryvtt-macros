/* ==========================================================================
    Macro:              Blackthorn Spear of the Endless Hunter
    Description:        Handles effects for the Spear
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


    // Check dependencies -----------------------------------------------------
    const cubCondition = game.macros.getName("CUBCondition");

    if (!cubCondition) {
        return ui.notifications.error("Requires the macro: CUBCondition to be present!");
    }


    // Apply Effects ----------------------------------------------------------
    if (props.state === "on") {

        // Handle exhaustion conditions ---------------------------------------
        const exhaustion = await getExhaustionEffects(props.actor) || [];
        cubCondition.execute(props.tokenID, exhaustion, "remove");


        // Set tracker flag ---------------------------------------------------
        DAE.setFlag(props.actor, "blackthorn-spear", {
            exhaustion
        });
    }


    // Remove Effects ---------------------------------------------------------
    if (props.state === "off") {

        // Get tracking flag --------------------------------------------------
        const flag = DAE.getFlag(props.actor, "blackthorn-spear");

        if (!flag) {
            return {};
        }

        // Update exhaustion conditions ---------------------------------------
        const exhaustion = flag.exhaustion;

        for (let i = 0; i < 2; i++) {
            exhaustion.push(`Exhaustion ${exhaustion.length + 1}`);
        }

        if (exhaustion.length >= 6) {
            const actorUpdate = game.macros.getName("ActorUpdate");

            if (actorUpdate) {
                actorUpdate.execute(props.tokenID, { "data.attributes.hp.value": 0 });
            }

            ui.notifications.info("You have died!");
        } else {
            cubCondition.execute(props.tokenID, exhaustion, "add");
        }


        // Remove tracker flag ------------------------------------------------
        DAE.unsetFlag(props.actor, "blackthorn-spear");
    }

    // You can see normally in darkness, both magical and nonmagical, out to a range of 120 feet
    // Your attacks with the blackthorn spear of the moonless hunter deal an extra 1d6 necrotic damage to any creature it hits
    // Your movement speed increases by 5 feet

})();

/**
 * Returns the specified effect
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getExhaustionEffects (actor) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    return actor.effects.reduce((effects, effect) => {
        if (effect.data.label.includes("Exhaustion")) {
            effects.push(effect.data.label);
        }

        return effects;
    }, []);
}


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
        name:  "Blackthorn Spear of the Endless Hunter",
        state: args[0] || "",

        actor:   tokenData.actor,
        tokenID: lastArg.tokenId
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
