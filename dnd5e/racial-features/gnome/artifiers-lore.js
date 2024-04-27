/* ==========================================================================
    Macro:              Artificer's Lore
    Description:        Handles rolls for stonecunning checks
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/master/5e/Racials/Dwarf/Stonecutting.js
    Usage:              OnUse: Stonecunning
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Artificer's Lore",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    itemData: lastArg.itemData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
let choice = "";

new Dialog({
    title: `${props.itemData.name} Skill Check`,
    content: "Pick one to roll",
    buttons: {
        advantage: { label: "Advantage", callback: () => { choice = "advantage" } },
        normal: { label: "Normal", callback: () => { choice = "normal" } },
        disadvantage: { label: "Disadvantage", callback: () => { choice = "disadvantage" } }
    },
    close: () => {
        const dice = choice === "advantage" ? "2d20kh" : choice === "disadvantage" ? "2d20kl" : "1d20";
        const rollType = choice === "advantage" ? "(Advantage)" : choice === "disadvantage" ? "(Disadvantage)" : "";
        const roll = new Roll(`${dice} + @abilities.int.mod + (@prof * 2)`, props.actorData.getRollData()).roll({ async: false });
        getRoll(roll, rollType, props);
    }
}).render(true);

/**
 * Handles the rolling of dice, as well as rendering the result to the chat pane
 *
 * @param  roll      The die roll to be performed
 * @param  rollType  Type of roll being made (Advantage | Normal | Disadvantage)
 */
async function getRoll (roll, rollType, props) {
    const diceRoll = roll.dice[0].results;
    const rollSuccess = roll.terms[0].results[0].result === 1 ? "fumble" : roll.terms[0].results[0].result === 20 ? "critical" : "";
    let getDice = "";

    game.dice3d?.showForRoll(roll);

    for (const dice of diceRoll) {
        if (dice.discarded) {
            getDice += `<li class="roll die d20 discarded">${dice.result}</li>`;
        } else {
            getDice += `<li class="roll die d20">${dice.result}</li>`;
        }
    }

    const rollResults = `
        <div class="dice-roll">
            <p>${props.itemData.name} Skill Check (History) ${rollType}</p>
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

    const chatMessage = game.messages.get(args[0].itemCardId);
    let content = duplicate(chatMessage.content);
    const searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${rollResults}`;

    content = content.replace(searchString, replaceString);
    await chatMessage.update({ content });
}


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
