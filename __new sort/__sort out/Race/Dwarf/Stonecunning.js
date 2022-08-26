/* ==========================================================================
    Macro:              Stonecunning
    Description:        Handles rolls for stonecunning checks
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Racials/Dwarf/Stonecutting.js
    Usage:              OnUse: Stonecunning
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name || "");

    if (!validateProps(props)) {
        return;
    }

    // Generate dialog for roll type ------------------------------------------
    let choice = "";

    new Dialog({
        title:   `${props.item.name} Skill Check`,
        content: "Pick one to roll",
        buttons: {
            advantage:    { label: "Advantage",    callback: () => { choice = "advantage" } },
            normal:       { label: "Normal",       callback: () => { choice = "normal" } },
            disadvantage: { label: "Disadvantage", callback: () => { choice = "disadvantage" } }
        },
        close: (html) => {
            const dice     = choice === "advantage" ? "2d20kh" : choice === "disadvantage" ? "2d20kl" : "1d20";
            const rollType = choice === "advantage" ? "(Advantage)" : choice === "disadvantage" ? "(Disadvantage)" : "";
            const roll     = new Roll(`${dice} + @abilities.int.mod + (@prof * 2)`, props.actor.getRollData()).roll();
            get_roll(roll, rollType, props);
        }
    }).render(true);

})();


/**
 * Handles the rolling of dice, as well as rendering the result to the chat pane
 *
 * @param  roll      The die roll to be performed
 * @param  rollType  Type of roll being made (Advantage | Normal | Disadvantage)
 */
async function get_roll (roll, rollType, props) {
    const diceRoll    = roll.dice[0].results;
    const rollSuccess = roll.terms[0].results[0].result === 1 ? "fumble" : roll.terms[0].results[0].result === 20 ? "critical" : "";
    let getDice       = "";

    game.dice3d?.showForRoll(roll);

    for (let dice of diceRoll) {
        if (dice.discarded) {
            getDice += `<li class="roll die d20 discarded">${dice.result}</li>`;
        } else {
            getDice += `<li class="roll die d20">${dice.result}</li>`;
        }
    }

    const rollResults = `
        <div class="dice-roll">
            <p>${props.item.name} Skill Check (History) ${rollType}</p>
            <div class="dice-result">
                <div class="dice-formula">${roll.formula}</div>
                <div class="dice-tooltip">
                    <div class="dice">
                        <header class="part-header flexrow">
                            <span class="part-formula">${roll.formula}</span>
                            <span class="part-total">${roll.total}</span>
                        </header>
                        <ol class="dice-rolls">${getDice}</ol>
                    </div>
                </div>
                <h4 class="dice-total ${rollSuccess}">${roll.total}</h4>
            </div>
        </div>
    `;

    const chatMessage   = game.messages.get(args[0].itemCardId);
    let content         = duplicate(chatMessage.data.content);
    const searchString  = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${rollResults}`;

    content = content.replace(searchString, replaceString);
    chatMessage.update({ content });
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    return {
        name:  "Stonecunning",
        actor: game.actors.get(args[0].actor._id),
        item:  args[0].item
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
