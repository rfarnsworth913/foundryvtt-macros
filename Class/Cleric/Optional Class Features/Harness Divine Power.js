/* ==========================================================================
    Macro:              Harness Divine Power
    Description:        Handles converting divne power into Spell Slots
    Source:             https://www.patreon.com/posts/harness-divine-53855097
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Validation Logic -------------------------------------------------------
    if (props.actor.data.data.spells.spell1.max === 0) {
        return ui.notifications.error(`No spell slots found on ${props.actor.name}`);
    }


    // Start processing data --------------------------------------------------
    const rollData = await props.actor.getRollData();
    const prof     = Math.ceil(rollData.prof / 2);
    let inputText  = "";

    if (hasAvailableSlot(props.actor)) {

        // Get options for available slots
        for (let i = 1; i <= prof; i++) {
            let chosenSpellSlots = getSpellSlots(props.actor, i);
            let minSlots         = chosenSpellSlots.value;
            let maxSlots         = chosenSpellSlots.max;

            if (minSlots !== maxSlots) {
                inputText += `
                    <div class="form-group">
                        <label for="spell${i}">
                            Spell Slot Level ${i} [${minSlots}/${maxSlots}]
                        </label>
                        <input id="spell${i}" name="spellSlot" value="${i}" type="radio" />
                    </div>
                `;
            }
        }

        new Dialog({
            title: props.item.name,
            content: `
                <form>
                    <p>Choose 1 spell slot to restore</p>
                    <hr />
                    ${inputText}
                </form>
            `,
            buttons: {
                recover: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Recover",
                    callback: async (html) => {
                        let selectedSlot = html.find(`input[name="spellSlot"]:checked`);
                        let slot         = "";
                        let num          = "";

                        for (let i = 0; i < selectedSlot.length; i++) {
                            slot = selectedSlot[i].id;
                            num  = selectedSlot[i].value;
                        }

                        if (slot === "") {
                            return ui.notifications.warn(`The ability fails, not spell slot was selected`);
                        }

                        spellRefund(props.actor, slot);
                        let rollResults     = `<div>Regains 1 spell slot, Level ${num}.</div>`;
                        const chatMessage   = game.messages.get(props.itemCardId);
                        let content         = duplicate(chatMessage.data.content);
                        const searchString  = /<div class="midi-qol-saves-display">[\\s\\S]*<div class="end-midi-qol-saves-display">/g;
                        const replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${rollResults}`;
                        content             = content.replace(searchString, replaceString);
                        chatMessage.update({ content });
                    }
                }
            }
        }).render(true);

    } else {
        return ui.notifications.warn(`You aren't missing any spell slots.`);
    }

})();

async function spellRefund (actorData, slot, num) {
    let actor_data = duplicate(actorData.data._source);
    actor_data.data.spells[`${slot}`].value = actor_data.data.spells[`${slot}`].value + 1;
    await actorData.update(actor_data);
}

function getSpellSlots (actorData, level) {
    return actorData.data.data.spells[`spell${level}`];
}

function hasAvailableSlot (actorData) {
    for (let slot in actorData.data.data.spells) {
        if (actorData.data.data.spells[slot].value < actor.data.data.spells[slot].max) {
            return true;
        }
    }

    return false;
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

    return {
        name:       "Harness Divine Power",
        actor:      canvas.tokens.get(lastArg.tokenId).actor,
        item:       lastArg.item,
        itemCardId: lastArg.itemCardId
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
