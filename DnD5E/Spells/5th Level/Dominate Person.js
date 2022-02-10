/* ==========================================================================
    Macro:              Dominate Person
    Description:        Handles applying the dominate condition
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


    // Check targets ----------------------------------------------------------
    if (props.targetActor === "" || props.spellLevel === 5) {
        return {};
    }


    // Effect on Target -------------------------------------------------------
    let duration = getDuration(props.spellLevel);
    let effect   = await getEffect({ actor: props.targetActor, effectLabel: "Dominate Person" });

    if (effect) {
        await wait (500);
        await props.targetActor.updateEmbeddedDocuments("ActiveEffect", [{
            _id: effect.id,
            duration: {
                seconds: duration
            }
        }]);
    }


    // Concentration on Self --------------------------------------------------
    let concentration = await getEffect({ actor: props.actorData, effectLabel: "Concentrating" });

    if (concentration) {
        await wait (500);
        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
            _id: concentration.id,
            duration: {
                seconds: duration
            }
        }]);
    }

})();

function getDuration (spellLevel) {
    return spellLevel === 6 ? 600 :
           spellLevel === 7 ? 3600 : 28800;
}

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}

/**
 * Checks if a specified actor has the expected effect applied to their character
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<Boolean>}       Status of the effect on target
 */
async function getEffect({ actor, effectLabel = `` } = {}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    return (actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
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
    console.warn(lastArg);

    return {
        name:  "Dominate Person",
        state: args[0] || "",

        actorData:   canvas.tokens.get(lastArg.tokenId)?.actor,
        targetActor: lastArg.failedSaves[0]?.actor || "",
        spellLevel:  lastArg.powerLevel || 5
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
