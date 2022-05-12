/* ==========================================================================
    Macro:              Focused Aim
    Description:        Handles expendture of Ki Points for Focused Aim
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

    // Create Dialog Values ---------------------------------------------------
    const kiPoints = await getResource({
        actorData: props.actorData,
        resource:  `Ki`
    });

    if (!kiPoints) {
        return notifications.error(`Ki points could not be found!`);
    }

    if (kiPoints.value === 0) {
        return notifications.error(`You do not have any remaining Ki points!`);
    }

    let options = [];
    for (let i = 1; i < 4; i++) {
        if (i <= kiPoints.value) {
            options.push(`<option value="${i}">+${i * 2} Attack (${i} Ki Point)</option>`);
        }
    }

    let dialogContent = `
        <form class="flexcol">
            <div class="form-group">
                <select id="kiPoints">
                    ${options.join("")}
                </select>
            </div>
        </form>
    `;

    // Create Dialog ----------------------------------------------------------
    new Dialog({
        title: `Focused Aim`,
        content: dialogContent,
        buttons: {
            yes: {
                icon:  `<i class="fas fa-check"></i>`,
                label: `Apply`,
                callback: async (html) => {

                    // Update Ki Points ---------------------------------------
                    let element = html.find(`#kiPoints`).val();
                    await editResource({
                        actorData: props.actorData,
                        resource:  `Ki`,
                        value:     -Math.abs(element)
                    });

                    // Update Chat --------------------------------------------
                    let chatMessage = game.messages.get(props.itemCardID);
                    let chatContent = `
                        <div class="midi-qol-nobox">
                            <div class="midi-qol-flex-container">
                                <div>Attack is improved by: +${element * 2}</div>
                            </div>
                        </div>
                    `;

                    let content       = duplicate(chatMessage.data.content);
                    let searchString  = /<div class="midi-qol-hits-display">[\\s\\S]*<div class="end-midi-qol-hits-display">/g;
                    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;

                    content = content.replace(searchString, replaceString);
                    chatMessage.update({ content });

                    playAnimation(props.tokenData);
                }
            },
            cancel: {
                icon:  `<i class="fas fa-times"></i>`,
                label: `Cancel`
            }
        },
        default: `yes`
    }).render(true);

})();

/**
 * Handles attempting to find a resource, and returning it
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @returns  {Promise<any>}       Actor update handler
 */
async function getResource ({ actorData, resource = ""} = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    let resources = actorData.toObject().data.resources;
    let [key, object] = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    return resources[key];
}

/**
 * Handles updating a global resource on the specified actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @param    {number}   value     New value of the resource
 * @returns  {Promise<any>}       Actor update handler
 */
async function editResource ({ actorData, resource = "", value = 1} = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    let resources = actorData.toObject().data.resources;
    let [key, object] = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    if (!key || !object) {
        return {};
    }

    // Attempt to update the resource with the specified value
    if (!object.value || !object.max) {
        object.value = object.max = value;
    } else {
        object.value = Math.clamped(object.value + value, 0, object.max);
    }

    resources[key] = object;

    return await actorData.update({ "data.resources": resources });
}

/**
 * Plays a simple animation
 *
 * @param  {Token5e}  token  Target token
 */
async function playAnimation (token) {
    if (game.modules.get("sequencer")?.active) {
        new Sequence()
            .effect()
                .file(`jb2a.hunters_mark.loop.01.blue`)
                .attachTo(token)
                .scaleToObject(1.0)
            .play();
    }
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
        name:  `Focused Aim`,
        state: args[0] || ``,

        actorData:  tokenData.actor || {},
        itemCardID: lastArg.itemCardId,
        tokenData,
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
