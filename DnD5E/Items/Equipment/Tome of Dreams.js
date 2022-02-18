/* ==========================================================================
    Macro:              Tome of Dreams
    Description:        Applies effects for the Tome of Dreams
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


    // Roll values ------------------------------------------------------------
    const chance = new Roll("1d20").roll({ async: false });
    game.dice3d.showForRoll(chance);

    const adjustment = new Roll("2d4").roll({ async: false });
    game.dice3d.showForRoll(adjustment);


    // Apply change -----------------------------------------------------------
    const type = chance.total >= 11 ? "temphp" : "psychic";

    new MidiQOL.DamageOnlyWorkflow(
        actor,
        token,
        adjustment.total,
        type,
        [props.target],
        adjustment,
        {
            flavor:     `Tome of Dreams - ${chance.total >= 11 ? "Healing (Temporary HP)" : "Damage (Psychic)"}`,
            itemCardId: props.itemCard
        }
    );


    // Animation --------------------------------------------------------------
    if (!(game.modules.get("sequencer")?.active)) {
        const animation = chance.total >= 11 ? "jb2a.healing_generic.200px.green" : "jb2a.explosion.04.dark_purple";

        new Sequence()
            .effect()
                .file(animation)
                .attachTo(props.target)
                .scale(0.5)
                .fadeIn(300)
                .fadeOut(300)
            .play();
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
    const lastArg = args[args.length - 1];

    return {
        name: "Tome of Dreams",

        itemCard: lastArg.itemCardId,
        target:   canvas.tokens.get(lastArg.tokenId)
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
