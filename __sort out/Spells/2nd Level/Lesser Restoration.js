/* ==========================================================================
    Macro:              Lesser Restoration
    Description:        Creates dialog box to handle removing condition
    Source:             https://www.patreon.com/posts/lesser-57539886
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Get effects affecting the actor
    let effects       = props.target.actor.effects.filter(i => props.conditions.includes(i.data.label));
    let selectOptions = effects.reduce((list, activeEffect) => {
        let condition = activeEffect.data.label;
        list.push(`<option value="${condition}">${condition}</option>`);
        return list;
    }, []);

    // Check for conditions
    if (selectOptions.length === 0) {
        return ui.notifications.error(`Nothing happens...There's nothing to Cure on ${props.target.name}`);
    }

    // Generate dialog content
    let dialogContent = `
        <form class="flexcol">
            <div class="form-group">
                <select id="element">
                    ${selectOptions.join("")}
                </select>
            </div>
        </form>
    `;

    // Create dialog box
    new Dialog({
        title: `Lesser Restoration: ${props.target.name}`,
        content: dialogContent,
        buttons: {
            yes: {
                icon:     '<i class="fas fa-check"></i>',
                label:    "Remove it!",
                callback: async (html) => {
                    let element = html.find("#element").val();
                    let effect  = props.target.actor.effects.find(i => i.data.label === element);

                    await MidiQOL.socket().executeAsGM("removeEffects", {
                        actorUuid: props.target.actor.uuid,
                        effects:   [effect.id]
                    });

                    let chatMessage = game.messages.get(args[0].itemCardId);
                    let chatContent = `
                        <div class="midi-qol-nobox">
                            <div class="midi-qol-flex-container">
                                <div>Cures ${element}:</div>
                                <div class="midi-qol-target-npc midi-qol-target-name" id="${props.target.data._id}"> ${props.target.name}</div>
                                <div>
                                    <img src="${props.target.data.img}" width="30" height="30" style="border:0px"></img>
                                </div>
                            </div>
                        </div>
                    `;

                    let content       = duplicate(chatMessage.data.content);
                    let searchString  = /<div class="midi-qol-hits-display">[\\s\\S]*<div class="end-midi-qol-hits-display">/g;
                    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;

                    content = content.replace(searchString, replaceString);
                    chatMessage.update({ content });
                    ui.chat.scrollBottom();
                }
            }
        },
        defaut: "yes"
    }).render(true);

})();


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    return {
        name:   "Lesser Restoration",
        target: canvas.tokens.get(args[0].targets[0].id),

        conditions: [
            "Blinded",
            "Deafened",
            "Diseased",
            "Paralyzed",
            "Poisoned"
        ]
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
