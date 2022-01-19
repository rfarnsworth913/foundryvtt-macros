/* ==========================================================================
    Macro:              Teleport
    Description:        Handles teleport within a specific scene
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


    // Check Dependencies -----------------------------------------------------
    if (!game.modules.get("warpgate")?.active) {
        return ui.notifications.error("Warpgate must be installed and active!");
    }

    if (!game.modules.get("sequencer")?.active) {
        return ui.notifications.error("Sequencer must be installed and active!");
    }


    // Configure teleport -----------------------------------------------------
    let options = {
        t:           "circle",
        user:        game.userId,
        x:           props.token.x + canvas.grid.size / 2,
        y:           props.token.y + canvas.grid.size / 2,
        direction:   0,
        distance:    30,
        borderColor: "#ff0000"
    };

    let [range] = await game.scenes.current.createEmbeddedDocuments("MeasuredTemplate", [options]);

    let position = await warpgate.crosshairs.show({
        size: 1,
        tag: randomID(),
        label: "Teleport to",
        drawOutline: false,
        drawIcon: false
    }, { show: async (crosshair) => {
        new Sequence()
            .effect()
                .from(props.token)
                .attachTo(crosshair)
                .persist()
                .opacity(0.5)
            .play();
    }});

    await range.delete();


    // Perform teleport -------------------------------------------------------
    new Sequence()
        .effect()
            .file("jb2a.misty_step.01.blue")
            .atLocation(props.token)
            .randomRotation()
            .scaleToObject(2)
        .wait(750)
        .animation()
            .on(props.token)
            .opacity(0.0)
            .waitUntilFinished()
        .animation()
            .on(props.token)
            .teleportTo(position)
            .snapToGrid()
            .waitUntilFinished()
        .effect()
            .file("jb2a.misty_step.02.blue")
            .atLocation(props.token)
            .randomRotation()
            .scaleToObject(2)
        .wait(1500)
        .animation()
            .on(props.token)
            .opacity(1.0)
        .play();

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
        name: "Teleport",
        token: canvas.tokens.get(lastArg.tokenId)
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
