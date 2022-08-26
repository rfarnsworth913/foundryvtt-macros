/* ==========================================================================
    Macro:              Booming Blade
    Description:        Handles applying damage for Booming Blade
    Source:             https://www.patreon.com/posts/booming-blade-56964900
    Usage:              DAE ItemMacro @target
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Movement Handler -------------------------------------------------------
    async function tokenMovement (tokenData, tokenId, diff, userId) {
        await wait(1000);

        // Validate Movement --------------------------------------------------
        if (tokenId._id !== props.target.id) {
            return {};
        }

        let currentPosition = await canvas.grid.getSnappedPosition(tokenData.data.x, tokenData.data.y, 1);
        let savedPosition   = await DAE.getFlag(props.target.actor, "BoomingBladePosition");

        if (savedPosition === undefined) {
            return {};
        }

        if ((currentPosition.x === savedPosition.x) &&
            (currentPosition.y === savedPosition.y)) {
                return {};
        }

        // Apply damage and remove effect -------------------------------------
        let damageRoll = await new Roll(`${props.dice}d8[${props.damageType}]`).evaluate({ async: true });
        game.dice3d?.showForRoll(damageRoll);

        await new MidiQOL.DamageOnlyWorkflow(
            props.tokenData.actor,
            props.tokenData,
            damageRoll.total,
            props.damageType,
            [props.target],
            damageRoll,
            {
                flavor:     `(${CONFIG.DND5E.damageTypes[props.damageType]})`,
                itemData:   props.item,
                itemCardId: "new"
            }
        );

        return await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: props.target.actor.uuid,
            effects:   [props.lastArg.effectId]
        });
    }


    // Apply effect -----------------------------------------------------------
    if (props.state === "on") {
        apply(props.target);

        let hookID  = Hooks.on("updateToken", tokenMovement);
        let hookPos = canvas.grid.getSnappedPosition(props.target.data.x, props.target.data.y, 1);

        DAE.setFlag(props.target.actor, "BoomingBlade", hookID);
        DAE.setFlag(props.target.actor, "BoomingBladePosition", hookPos);
    }


    // Remove effect ----------------------------------------------------------
    if (props.state === "off") {
        explode(props.target);

        let hookID = DAE.getFlag(props.target.actor, "BoomingBlade");
        Hooks.off("updateToken", hookID);

        DAE.unsetFlag(props.target.actor, "BoomingBlade");
        DAE.unsetFlag(props.target.actor, "BoomingBladePosition");
    }
})();

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
 * Handles removing the animation from the target
 */
function explode (target) {
    if (!(game.modules.get("sequencer")?.active)) {
        return {};
    }

    Sequencer.EffectManager.endEffects({
        name: `Booming-Blade-${target.id}`
    });

    new Sequence()
        .effect()
            .file("jb2a.impact.012.blue")
            .atLocation(target)
            .scaleToObject(1.0)
        .play();
}

/**
 * Handles adding the animation to the target
 */
function apply (target) {
    new Sequence()
        .effect()
            .file("jb2a.static_electricity.01.blue")
            .attachTo(target)
            .scaleToObject(1.0)
            .persist()
            .name(`Booming-Blade-${target.id}`)
        .play();
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
    const tokenData = canvas.tokens.get(args[1]);
    const spellLevel = tokenData.actor.data.type === "character" ?
                       tokenData.actor.data.data.details.level :
                       tokenData.actor.data.data.details.cr;

    return {
        name:  "Booming Blade",
        state: args[0] || "",

        lastArg,

        damageType: "thunder",
        dice:       1 + (Math.floor((spellLevel + 1) / 6)),
        item:       lastArg.efData.flags.dae.itemData,
        target:     canvas.tokens.get(lastArg.tokenId) || "",
        tokenData
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
