/* ==========================================================================
    Macro:              Net
    Description:        Handles applying Net to a specified target
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
    if (!game.modules.get("warpgate").active) {
        return ui.notifications.error("Warpgate must be enabled!");
    }

    if (props.targets === null) {
        return ui.notifications.warn("No targets failed their save!");
    }

    await warpgate.wait(1000);


    // Summon Token -----------------------------------------------------------
    if (props.state === "on") {

        // Summon at coordinates ----------------------------------------------
        const location  = props.target.center;
        const gridScale = game.scenes.current.data.grid;
        location.x += gridScale * (0.5 * props.target.data.width);
        location.y -= gridScale * (0.5 * props.target.data.height);

        // Summon and apply updates -------------------------------------------
        const updates  = {
            token: {
                height: 0.5,
                width:  0.5
            }
        };
        const target = await warpgate.spawnAt(location, props.summonToken, updates);
        await props.actor.setFlag("midi-qol", props.summonLabel, target[0]);

        // Attach tracker to host token ---------------------------------------
        if (game.modules.get("token-attacher")) {
            await tokenAttacher.attachElementToToken(canvas.tokens.get(target[0]), props.target, true);
        }
    }


    // Unsummon Token ---------------------------------------------------------
    if (props.state === "off") {

        const target = await props.actor.getFlag("midi-qol", props.summonLabel);

        if (target) {
            if (game.modules.get("token-attacher")) {
                await tokenAttacher.detachElementFromToken(canvas.tokens.get(target), props.target, true);
            }

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
        name:   "Net",
        state:  args[0] || "",
        item:   args[2] || {},

        lastArg,

        actor:       tokenData?.actor || {},
        summonLabel: `${args[2]?.name?.replace(" ", "_")}_Summoned_Token`,
        summonToken: args[1] || "",
        target:      tokenData || null
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
