/* ==========================================================================
    Macro:              Arcane Recovery
    Description:        Handles recovery of spell slots
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/5e/Classes/Wizard/Arcane-Recovery.js
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Handle restoring spells ------------------------------------------------
    let numRec = Math.ceil(props.level / 2);

    if (hasAvailableSlot(props.actor)) {
        let inputText = "";

        for (let i = 1; i <= 5; i++) {
            let chosenSpellSlots = getSpellSlots(props.actor, i);
            let minSlots         = Math.abs(chosenSpellSlots.value - chosenSpellSlots.max);
            let maxSlots         = minSlots >= numRec ? numRec : minSlots;

            if (chosenSpellSlots.max > 0 && chosenSpellSlots.value < chosenSpellSlots.max) {
                inputText += `
                    <div class="form-group">
                        <label for="spell${i}">Spell Slot Level ${i} [${chosenSpellSlots.value}/${chosenSpellSlots.max}]</label>
                        <input id="spell${i}" name="spell${i}" type="number" min="0" max="${maxSlots}" />
                    </div>
                `;
            }
        }

        new Dialog({
            title: "Arcane Recovery",
            content: `
                <form>
                    <p>You have regained <strong>${numRec}</strong> spell slots.</p>
                    <hr />
                    ${inputText}
                </form>
            `,
            buttons: {
                recover: {
                    icon:     `<i class=fas fa-check></i>`,
                    label:    "Recover",
                    callback: async (html) => {
                        for (let i = 1; i <= 5; i++) {
                            let numRes = html.find(`#spell${i}`).val();
                            spellRefund(props.actor, i, numRes);
                        }
                    }
                }
            }
        }).render(true);

    } else {
        return ui.notifications.warn(`You aren't missing any spell slots.`);
    }

})();

function spellRefund (actorData, i, numRestored) {
    let actor_data = duplicate(actorData.data._source);
    actor_data.data.spells[`spell${i}`].value = Number(actor_data.data.spells[`spell${i}`].value) + Number(numRestored);
    actorData.update(actor_data);
}

function getSpellSlots (actorData, level) {
    return actorData.data.data.spells[`spell${level}`];
}

function hasAvailableSlot (actorData) {
    for (let slot in actorData.data.data.spells) {
        if (actorData.data.data.spells[slot].value < actorData.data.data.spells[slot].max) {
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
    const lastArg   = args[args.length - 1];
    const actorData = game.actors.get(lastArg.actor._id);

    return {
        name:  "Arcane Recovery",
        actor: actorData,
        level: actorData.getRollData().classes.wizard.levels || 0
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
