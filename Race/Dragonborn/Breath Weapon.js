/* ==========================================================================
    Macro:              Breath Weapon
    Description:        Handles applying damage from Breath Weapons
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


    // Check if values are correct --------------------------------------------
    if (props.damageType === "") {
        return ui.notitifications.error("Damage type is not defined!");
    }

    if (!props.damageDice) {
        return ui.notifications.error("Damage dice is not defined!");
    }


    // Determine and apply damage ---------------------------------------------
    let damageRoll = new Roll(props.damageDice).roll({ async: false });

    if (props.targets.failed.length > 0) {
        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            damageRoll.total,
            props.damageType.toLowerCase(),
            props.targets.failed,
            damageRoll,
            { flavor: `${props.item.name} - Damage Roll (${props.damageType})` }
        );
    }

    if (props.targets.success.length > 0) {
        new MidiQOL.DamageOnlyWorkflow(
            actor,
            token,
            Math.ceil(damageRoll.total / 2),
            props.damageType.toLowerCase(),
            props.targets.success,
            damageRoll,
            { flavor: `${props.item.name} - Damage Roll (${props.damageType})` }
        );
    }

})();

function getDamageType (name) {
    return ["Acid", "Cold", "Fire", "Lightning", "Poison"].filter((item) => {
        return name.indexOf(item) > 0;
    });
}

function getDamageDice (level) {
    return level < 5  ? "1d10" :
           level < 11 ? "2d10" :
           level < 17 ? "3d10" : "4d10";
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
        name:       "Breath Weapon",
        damageType: getDamageType(lastArg.item.name)[0] || "",
        damageDice: getDamageDice(lastArg.actor.data.attributes.hd),
        item:       lastArg.item,
        targets: {
            failed:  lastArg.failedSaves,
            success: lastArg.saves
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
