/* ==========================================================================
    Macro:              Portent
    Description:        Handles dice for portents
    Source:             https://gitlab.com/Freeze020/foundry-vtt-scripts/-/blob/master/DnD5e%20specific%20macros/portent.js
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Display dialog box -----------------------------------------------------
    let dialogButtons = await generateDialog(props.actorData, props.itemData, props.tokenData);
    new Dialog({
        title:   `Portent`,
        content: `Make a choice`,
        buttons: dialogButtons
    }).render(true);

})();


/**
 * Handles generating the buttons for the Portent Dialog
 *
 * @param  {Actor5e}  actorData  Actor rolling portents
 * @param  {Item5e}   item       Item source
 * @param  {Token5e}  tokenData  Target for animation
 * @returns                      Controls for the dialog box
 */
async function generateDialog (actorData, item, tokenData) {
    let portentRolled = await actorData.getFlag("world", "portent");
    let diceNumber    = actorData.data.data.classes.wizard.levels < 14 ? 2 : 3;
    let myButtons     = {};

    // Generate Portent Rolls -------------------------------------------------
    if (portentRolled) {
        myButtons = portentRolled.reduce((buttons, roll) => {
            let messageContent = `I foresaw this event and choose to roll: <b>${roll}</b>`;

            buttons[roll] = {
                label: `Roll: ${roll}`,
                callback: async () => {
                    ChatMessage.create({
                        content: `
                            <div class="dnd5e chat-card">
                                <header class="card-header flexrow">
                                    <img src="${item.img}" title="${item.name}" width="36" height="36" />
                                    <h3 class="item-name">${item.name}</h3>
                                </header>
                            </div>
                        ` + messageContent,
                        speaker: { alias: actorData.name }
                    });

                    portentRolled.splice(portentRolled.indexOf(roll), 1);
                    await actorData.setFlag("world", "portent", portentRolled);

                    playAnimation(tokenData, "green");
                }
            }

            return buttons;
        }, {});
    }


    // Create new portent rolls -----------------------------------------------
    myButtons.reset = {
        label: `Refresh, a new day`,
        callback: async () => {
            let portentRolls   = [];
            let messageContent = "";
            let index          = 1;
            let myRoll         = await new Roll(`${diceNumber}d20`).evaluate({
                async: true
            });

            for (let result of myRoll.terms[0].results) {
                portentRolls.push(result.result);
                messageContent += `Roll ${index} - <b>${result.result}</b><br />`;
                index++;
            }

            await actorData.setFlag("world", "portent", portentRolls);

            ChatMessage.create({
                content: `
                    <div class="dnd5e chat-card">
                        <header class="card-header flexrow">
                            <img src="${item.img}" title="${item.name}" width="36" height="36" />
                            <h3 class="item-name">${item.name}</h3>
                        </header>
                    </div>
                    <p>My portent forsees the following outcomes:</p> ${messageContent}
                `,
                speaker: {
                    alias: actorData.name
                }
            });

            playAnimation(tokenData, "yellow");
        }
    }

    return myButtons;
}

/**
 * Plays an animation on the target
 *
 * @param  {Token5e}  target  Target to play animation on
 * @param  {String}   color   Color of the animation
 */
 function playAnimation (target, color) {
    if (game.modules.get(`sequencer`).active) {
        new Sequence()
            .effect()
                .file(`jb2a.magic_signs.rune.divination.intro.${color}`)
                .scaleToObject(1.75)
                .atLocation(target)
                .waitUntilFinished(-550)
            .effect()
                .file(`jb2a.magic_signs.rune.divination.loop.${color}`)
                .scaleToObject(1.75)
                .atLocation(target)
                .fadeIn(200)
                .fadeOut(200)
                .waitUntilFinished(-550)
            .effect()
                .file(`jb2a.magic_signs.rune.divination.outro.${color}`)
                .scaleToObject(1.75)
                .atLocation(target)
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
        name:  `Portent`,

        lastArg,

        actorData: tokenData.actor || {},
        itemData:  lastArg.itemData || {},
        tokenData
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
