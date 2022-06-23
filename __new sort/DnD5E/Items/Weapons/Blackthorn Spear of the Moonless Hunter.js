/* ==========================================================================
    Macro:              Blackthorn Spear of the Moonless Hunter
    Description:        Handles effects for the Spear
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
    const cubCondition = game.macros.getName(`CUBCondition`);

    if (!cubCondition) {
        return ui.notifications.error(`Requires the macro CUBCondition to be present!`);
    }


    // Apply Effects ----------------------------------------------------------
    if (props.state === "on") {

        // Handle exhaustion conditions ---------------------------------------
        const exhaustion = await getExhaustionEffects({ actorData: props.actorData }) || [];
        cubCondition.execute(props.tokenData.id, exhaustion, "remove");

        // Update weapon damage -----------------------------------------------
        const weapon = await getItems({
            actorData: props.actorData,
            itemLabel: `Blackthorn Spear of the Moonless Hunter`
        });
        let weaponData = {};

        if (weapon) {
            weaponData = duplicate(weapon[0]);

            weaponData.data.damage.parts.push([`1d6`, `necrotic`]);
            props.actorData.updateEmbeddedDocuments(`Item`, [weaponData]);

            ChatMessage.create({ content: `${weaponData.name} is enhanced.`});
        }

        console.warn(weapon, weaponData.data.damage);

        // Set tracker flag ---------------------------------------------------
        DAE.setFlag(props.actorData, props.flagLabel, {
            exhaustion,
            damage: weaponData.data.damage
        });
    }


    // Remove Effects ---------------------------------------------------------
    if (props.state === "off") {

        // Get tracking flag --------------------------------------------------
        const flag = DAE.getFlag(props.actorData, props.flagLabel);

        if (!flag) {
            return {};
        }

        // Update exhaustion conditions ---------------------------------------
        const exhaustion = flag.exhaustion;

        for (let i = 0; i < 2; i++) {
            exhaustion.push(`Exhaustion ${exhaustion.length + 1}`);
        }

        if (exhaustion.length >= 6) {
            const actorUpdate = game.macros.getName("ActorUpdate");

            if (actorUpdate) {
                actorUpdate.execute(props.tokenData.id, { "data.attributes.hp.value": 0 });
            }

            ui.notifications.info("You have died!");
        } else {
            cubCondition.execute(props.tokenData.id, exhaustion, "add");
        }

        // Reset weapon status ------------------------------------------------
        const weapon = await getItems({
            actorData: props.actorData,
            itemLabel: `Blackthorn Spear of the Moonless Hunter`
        });

        if (weapon && flag) {
            const weaponData = duplicate(weapon[0]);
            flag.damage.parts.pop();

            weaponData.data.damage.parts = flag.damage.parts;
            props.actorData.updateEmbeddedDocuments(`Item`, [weaponData]);

            ChatMessage.create({ content: `${weaponData.name} return to normal`});
        }

        // Remove tracker flag ------------------------------------------------
        DAE.unsetFlag(props.actorData, props.flagLabel);
    }

})();

/**
 * Returns the collection of Exhaustion effects on the target
 *
 * @param    {Actor5e}  actor         Target Actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getExhaustionEffects ({ actorData } = {}) {
    if (!actorData) {
        return console.error(`No actor specified!`);
    }

    return actorData.effects.reduce((exhaustionEffects, effect) => {
        if (effect.data.label.includes("Exhaustion")) {
            exhaustionEffects.push(effect.data.label);
        }

        return exhaustionEffects;
    }, []);
}

/**
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = ``} = {}) {
    if (!actorData) {
        return null;
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
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
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId);

    return {
        name:  `Blackthorn Spear of the Moonless Hunter`,
        state: args[0] || ``,

        actorData: tokenData.actor,
        tokenData,

        flagLabel: `blackthorn-spear`
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
