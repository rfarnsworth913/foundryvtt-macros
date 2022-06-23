/* ==========================================================================
    Macro:              Lay on Hands
    Description:        Handles Lay on Hands
    Source:             https://www.patreon.com/posts/lay-on-hands-61887734
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Validate Targets -------------------------------------------------------
    if (props.targets.length === 0) {
        return ui.notifications.error(`Please select a single target!`);
    }

    // Target information -----------------------------------------------------
    const target        = canvas.tokens.get(props.targets[0].id);
    const creatureTypes = ["undead", "construct"];
    let illegal         = creatureTypes.some((index) => {
        return (target.actor.data.data.details.race || target.actor.data.data.details.type.value).toLowerCase().includes(index);
    });

    // Get Resource Information -----------------------------------------------
    const resourceData = await getResource({
        actorData: props.actorData,
        resource:  `Lay on Hands`
    });

    if (!resourceData) {
        return ui.notifications.error(`${props.itemData.name} Resource is missing on ${props.tokenData.name}, Add it!`);
    }
    let currentValue = resourceData.value;
    let maxResRnd    = resourceData.max / 5;
    let curtResRnd   = Math.floor(resourceData.value / 5);
    let maxHealz     = Math.clamped(resourceData.value, 0, target.actor.data.data.attributes.hp.max - target.actor.data.data.attributes.hp.value);

    if (illegal) {
        return ui.notifications.error(`You cannot use ${props.itemData.name} on this target`);
    }

    if (currentValue === null || currentValue === 0) {
        return ui.notifications.warn(`You are out of the required resources for ${props.itemData.name}.`);
    }

    // Master Dialog Creation -------------------------------------------------
    new Dialog({
        title: props.itemData.name,
        content: `<p>Which <strong>Action</strong> would you like to do? [${currentValue}] points remaining.</p>`,
        buttons: {
            cure: {
                label: `Cure Condition`,
                callback: () => {
                    handleCure({
                        target,
                        itemData: props.itemData,
                        tokenData: props.tokenData
                    });
                }
            },
            heal: {
                label: `Heal`,
                callback: () => { handleHeal(); }
            }
        }
    }).render(true);

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
 * Handles attempting to find a resource, and returning it
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @returns  {Promise<any>}       Actor update handler
 */
async function getResource ({ actorData, resource = ``} = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    let resources = actorData.toObject().data.resources;
    let [key] = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    return resources[key];
}

/**
 * Handles curing the target of diseases
 *
 * @param  {Token5e}  target     Target effected
 * @param  {Item5e}   itemData   Item Data
 * @param  {Token5e}  tokenData  Source Token Data
 */
function handleCure ({ target, itemData, tokenData } = {}) {

    // Get conditions ---------------------------------------------------------
    const conditionList = ["Diseased", "Poisoned"];
    const effects       = target.actor.effects.filter((effect) => {
        return conditionList.includes(effect.data.label);
    });

    let selectOptions = ``;
    for (let i = 0; i < effects.length; i++) {
        const condition = effects[i].data.label;
        selectOptions += `<option value="${condition}">${condition}</option>`;
    }

    // Create Cure Dialog -----------------------------------------------------
    if (selectOptions === ``) {
        return ui.notifications.warn(`There's nothing to Cure on ${target.name}.`);
    }

    let dialogContent = `
        <p><em>${tokenData.name} ${itemData.name} on ${target.name}.</em></p>
        <p>Choose a Condition to Cure |
    `;

    new Dialog({
        title: `${itemData.name}: Curing`,
        content: ``,
        buttons: {
            cure: {
                icon:     `<i class="fas fa-check"></i>`,
                label:    `Cure!`,
                callback: async (html) => {
                    console.warn("Cure");
                }
            }
        }
    })
}

function handleHeal () {
    console.warn("Heal");
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
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  `Lay on Hands`,
        state: args[0] || ``,

        actorData: tokenData.actor || {},
        itemData:  lastArg.item,
        tokenData,

        targets: lastArg.targets
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
