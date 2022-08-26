/* ==========================================================================
    Macro:              Absorbing Tattoo
    Description:        Handles healing from damage sources
    Source:             Custom
    Usage:              DAE Item Macro  @item
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = await getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    if (props.state === "off") {

        // Check that we have a damage type ----------------------------------------
        if (props.damageType === "") {
            return ui.notifications.error(`Damage type is not defined!`);
        }


        // Get Damage Workflow ----------------------------------------------------
        let messageHistory = Object.values(MidiQOL.Workflow.workflows).reduce((list, workflow) => {

            workflow.hitTargets.forEach((target) => {

                if (target.id === props.tokenID &&
                    workflow.workflowType === "Workflow" &&
                    workflow.damageDetail.length > 0) {
                    list.push(workflow);
                }
            });

            return list;
        }, [])[0];

        if (!messageHistory) {
            return ui.notifications.error(`No valid workflow was found!`);
        }


        // Determine healing amount -------------------------------------------
        let baseDamage = 0;

        messageHistory.damageDetail.forEach((damageDetail) => {
            if (damageDetail.type === props.damageType) {
                baseDamage += Math.floor(damageDetail.damage / 2);
            }
        });


        // Apply Healing ------------------------------------------------------
        const damageRoll = await new Roll(`1d1 + ${baseDamage} - 1`).evaluate({ async: false });
        const target     = await canvas.tokens.get(props.tokenID);

        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            damageRoll.total,
            "healing",
            [target],
            damageRoll,
            { flavor: `${props.item.name} -  Healing (Healing)` }
        );
    }

})();

function getResistanceType (name) {
    return ["Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder"].filter((resistance) => {
        return name.indexOf(resistance) > 0;
    });
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
async function getProps () {
    const lastArg = args[args.length - 1];

    return {
        name:       "Absorbing Tattoo",
        state:      args[0] || "",
        damageType: getResistanceType(args[1]?.name || "")[0].toLowerCase() || "",
        item:       args[1],
        actorID:    lastArg.actorId || "",
        tokenID:    lastArg.tokenId || ""
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
