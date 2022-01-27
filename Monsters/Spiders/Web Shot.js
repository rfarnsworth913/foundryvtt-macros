/* ==========================================================================
    Macro:              Web Shot
    Description:        Handles applying Web Shot to a specified target
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
    if (!game.modules.get("warpgate").active) {
        return ui.notifications.error("Warpgate must be enabled!");
    }

    if (props.targets === null)  {
        return ui.notifications.warn("No targets failed their save!");
    }

    await warpgate.wait(1000);


    // Summon Token -----------------------------------------------------------
    if (props.state === "on") {

        // Summon at coordinates ----------------------------------------------
        const location  = props.target.center;
        const gridScale = game.scenes.current.data.grid;
        location.x += gridScale * .5;
        location.y -= gridScale * .5;

        // Summon and apply updates -------------------------------------------
        const updates  = {
            actor: {
                data: {
                    attributes: {
                        ac: {
                            value: 10
                        },
                        hp: {
                            value: 20,
                            max:   20
                        },
                        traits: {
                            di: ["bludgeoning", "poison", "psychic"],
                            dv: ["fire"]
                        }
                    }
                }
            },
            token: {
                height: 0.5,
                width:  0.5
            }
        };
        const target = await warpgate.spawnAt(location, props.summonToken, updates);

        // Generate DAE Tracker Effect ----------------------------------------
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
                rounds:     0,
                seconds:    3600,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            icon:  props.item?.img,
            label: props.item?.name + " Token"
        };

        await props.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);

        // Attach tracker to host token ---------------------------------------
        if (game.modules.get("token-attacher")) {
            await tokenAttacher.attachElementToToken(canvas.tokens.get(target[0]), props.target, true);
        }
    }


    // Unsummon Token ---------------------------------------------------------
    if (props.state === "off") {

        // Get tracker effect and remove from target --------------------------
        const effect = props.actor.effects.find(i => i.data.label === props.item.name + " Token");

        if (!effect) {
            return;
        }

        const target = `${getProperty(props.actor.data.flags, `midi-qol.${props.summonLabel}`)}`;

        if (game.modules.get("token-attacher")) {
            await tokenAttacher.detachElementFromToken(canvas.tokens.get(target), props.target, true);
        }

        await warpgate.dismiss(target, game.scenes.current.data.document.id);
        await props.actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
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
        name:   "Web Shot",
        state:  args[0] || "",
        item:   args[2] || {},

        lastArg,

        actor:       tokenData?.actor || {},
        summonLabel: "Summoned_Token",
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
