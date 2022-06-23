/* ==========================================================================
    Macro:              Arcane Recovery
    Description:        Handles recovery of spell slots for Wizards
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

    if (hasAvailableSlot(props.actorData)) {

        // Generate dialog ----------------------------------------------------
        let inputContent = ``;

        for (let i = 1; i <= 5; i++) {
            let chosenSpellSlots = getSpellSlots(props.actorData, i);
            let minSlots         = Math.abs(chosenSpellSlots.value - chosenSpellSlots.max);
            let maxSlots         = minSlots >= numRec ? numRec : minSlots;

            if (chosenSpellSlots.max > 0 && chosenSpellSlots.value < chosenSpellSlots.max) {
                inputContent += `
                    <div class="form-group">
                        <label for="spell${i}">Spell Slot Level ${i} [${chosenSpellSlots.value}/${chosenSpellSlots.max}]</label>
                        <input id="spell${i}" name="spell${i}" type="number" min="0" max="${maxSlots}" />
                    </div>
                `;
            }
        }


        // Show dialog --------------------------------------------------------
        new Dialog({
            title: `Arcane Recovery`,
            content: `
                <form>
                    <p>You have regained <strong>${numRec}</strong> spell slots.</p>
                    <hr />
                    ${inputContent}
                </form>
            `,
            buttons: {
                recover: {
                    icon:     `<i class=fas fa-check></i>`,
                    label:    `Recover`,
                    callback: async (html) => {
                        playAnimation(props.tokenData);

                        for (let i = 1; i <= 5; i++) {
                            let numRes = html.find(`#spell${i}`).val();
                            spellRefund(props.actorData, i, numRes);
                        }
                    }
                }
            }
        }).render(true);
    } else {
        return ui.notifications.warn(`You aren't missing any spell slots.`);
    }

})();


// Helper Functions -----------------------------------------------------------

/**
 * Plays an animation on the target
 *
 * @param  {Token5e}  target  Target to play animation on
 */
function playAnimation (target) {
    if (game.modules.get(`sequencer`).active) {
        new Sequence()
            .effect()
                .file(`jb2a.magic_signs.circle.02.divination.intro.purple`)
                .scaleToObject(1.75)
                .atLocation(target)
                .belowTokens()
                .waitUntilFinished(-550)
            .effect()
                .file(`jb2a.magic_signs.circle.02.divination.loop.purple`)
                .scaleToObject(1.75)
                .atLocation(target)
                .belowTokens()
                .fadeIn(200)
                .fadeOut(200)
                .waitUntilFinished(-550)
            .effect()
                .file(`jb2a.magic_signs.circle.02.divination.outro.purple`)
                .scaleToObject(1.75)
                .atLocation(target)
                .belowTokens()
            .play();
    }
}

/**
 * Handles refunding spells to the target
 *
 * @param  {Actor5e}  actorData    Actor to be updated
 * @param  {Number}   i            Spell level to be modified
 * @param  {Number}   numRestored  Number of spell slots restored
 */
function spellRefund (actorData, i, numRestored) {
    let actor_data = duplicate(actorData.data._source);
    actor_data.data.spells[`spell${i}`].value = Number(actor_data.data.spells[`spell${i}`].value) + Number(numRestored);
    actorData.update(actor_data);
}

/**
 * Returns the number of spell slots for a specified level
 *
 * @param  {Actor5e}  actorData  Actor to be updated
 * @param  {Number}   level      Spell level
 * @returns                      Number of spell slots available
 */
function getSpellSlots (actorData, level) {
    return actorData.data.data.spells[`spell${level}`];
}

/**
 * Checks if there are spell slots to be restored
 * @param  {Actor5e}  actorData  Actor to be updated
 * @returns                      If there are slots to be restored
 */
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
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  ``,
        state: args[0] || ``,

        actorData: tokenData.actor || {},
        tokenData,
        level:     tokenData.actor.getRollData().classes.wizard.levels || 0
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
