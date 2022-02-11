/* ==========================================================================
    Macro:              Coldsnap
    Description:        Handles applying effect to target based on saving throw
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


    // Check for target -------------------------------------------------------
    if (props.targetActor === "") {
        return {};
    }


    // Request saving throw ---------------------------------------------------
    let flavor = `Cold Feet: ${CONFIG.DND5E.abilities["con"]} DC: 15`
    let save = (await props.targetActor.rollAbilitySave("con", { flavor })).total;


    // Handle successful save -------------------------------------------------
    if (save >= 15) {
        props.effectBase.changes = [];

        props.movementTypes.forEach((movementType) => {
            props.effectBase.changes.push({
                key:      `data.attributes.movement.${movementType}`,
                mode:     0,
                priority: 20,
                value:    `"@attributes.movement.${movementType} / 2"`
            });
        });

        await props.targetActor.createEmbeddedDocuments("ActiveEffect", [props.effectBase]);
    }


    // Handle failed save -----------------------------------------------------
    if (save < 15) {
        props.effectBase.changes = [{
            key:      "data.attributes.movement.all",
            mode:     0,
            priority: 20,
            value:    "0"
        }];

        await props.targetActor.createEmbeddedDocuments("ActiveEffect", [props.effectBase]);
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
    const lastArg  = args[args.length - 1];
    const itemData = lastArg.itemData;
    console.warn(lastArg);

    return {
        name: "Coldsnap",

        effectBase: {
            label:    itemData.name,
            icon:     itemData.img,
            disabled: false,
            duration: {
                rounds:     1,
                turns:      1,
                seconds:    12,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            flags: {
                dae: {
                    specialDuration: ["turnEndSource"]
                }
            },
            origin: lastArg.uuid
        },

        itemData:      "",
        movementTypes: ["walk", "burrow", "climb", "fly", "swim"],
        targetActor:   lastArg.hitTargets[0]?.actor || ""
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
