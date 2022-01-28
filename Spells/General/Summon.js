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


        // Summon Tracking ----------------------------------------------------
        const effectData = {
            changes: [{
                key:      `flags.midi-qol.${props.summonLabel}`,
                mode:     5,
                value:    target[0],
                priority: 20
            }],
            origin: props.lastArg?.origin,
            disabled: false,
            duration: {
                round:      0,
                seconds:    props.duration,
                startRound: game.combata ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            icon:  props.item?.img,
            label: props.item?.name + " Token"
        };

        await props.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }


    // Unsummon Token ---------------------------------------------------------
    if (props.state === "off") {

        if (!await hasEffect({ actor: props.actor, effectLabel: props.item.name + " Token"})) {
            return;
        }

        const target = `${getProperty(props.actor.data.flags, `midi-qol.${props.summonLabel}`)}`;
        await warpgate.dismiss(target, game.scenes.current.data.document.id);
        await removeEffect({ actor: props.actor, effectLabel: props.item.name + " Token"});
    }

})();


/**
 * Checks if a specified actor has the expected effect applied to their character
 *
 * @param    {object}  [options]
 * @param    {Actor5e}  actor         Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<Boolean>}       Status of the effect on target
 */
async function hasEffect({ actor, effectLabel = `` } = {}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    return Boolean(actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
}

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actor, effectLabel = ""}) {
    if (!actor) {
        return console.error("No actor specified!");
    }

    let effect = actor.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
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
    const tokenData = canvas.tokensg.get(lastArg.tokenId);

    return {
        name: "Summon",
        state: args[0] || "",
        item:  args[2] || {},

        lastArg,

        actor:       tokenData?.actor || {},
        duration:    3600,
        summonLabel: "Summoned_Token",
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
