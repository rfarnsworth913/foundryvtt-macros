/* ==========================================================================
    Macro:              Detect
    Description:        Detects a specified item
    Source:             https://gitlab.com/crymic/foundry-vtt-macros/-/blob/8.x/Trigger%20Happy/Detect.js
    Usage:              Trigger Happy: @Token[Name of Trap] @Trigger[] @ChatMessage[/DetectTrap CheckDC "Door, Item or Trap" "Trap or Wall ID"]
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }

    // Get check information --------------------------------------------------
    let passTest = await actor.data.data.skills.prc.passive;
    let skillMax = Math.max(passTest);

    // If we want an active check and passive check, use the below code
    // let skillTest = await actor.rollSkill("prc", { fastForward: true, chatMessage: false });
    // let skillMax  = Math.max(passTest, skillTest.total);

    console.info(`Perception Score of ${skillMax} vs ${props.checkDC}`);

    // Handle successful checks -----------------------------------------------
    if (skillMax >= props.checkDC) {

        // Handle Doors -------------------------------------------------------
        if (props.type === "Door") {
            if (canvas.walls.get(props.targetID).data.door === 2) {
                canvas.walls.get(props.targetID).update({ door: 1 });

                let message = `You have spotted a hidden door!`;
                let chatData = {
                    user:    game.user._id,
                    content: message,
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    speaker: ChatMessage.getSpeaker({ alias: "Door" })
                };

                ChatMessage.create(chatData, {});
            }
        }

        // Handle Traps -------------------------------------------------------
        if (props.type === "Trap") {
            if (canvas.tokens.get(props.targetID).data.hidden) {
                canvas.tokens.get(props.targetID).document.update({ hidden: false });

                let message = `You have spotted a trap!`;
                let chatData = {
                    user:    game.user._id,
                    content: message,
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    speaker: ChatMessage.getSpeaker({ alias: "Trap" })
                };

                ChatMessage.create(chatData, {});
            }
        }

        // Handle Items -------------------------------------------------------
        if (props.type === "Item") {
            if (cavnas.tokens.get(props.targetID).data.hidden) {
                canvas.tokens.get(props.targetID).document.update({ hidden: false });

                let message = `You have spotted something!`;
                let chatData = {
                    user:    game.user._id,
                    content: message,
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    speaker: ChatMessage.getSpeaker({ token: actor })
                };

                ChatMessage.create(chatData, {});
            }
        }
    }

    // Handle close skill checks ----------------------------------------------
    if ((props.checkDC - skillMax) <= 3) {

        // Handle Doors -------------------------------------------------------
        if (props.type === "Door") {
            if (canvas.walls.get(props.targetID).data.door === 2) {
                let chatData = {
                    user:    game.user._id,
                    content: "You sense something is amiss.",
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    spealer: ChatMessage.getSpeaker({ token: actor })
                };

                ChatMessage.create(chatData, {});
            }
        }

        // Handle Traps -------------------------------------------------------
        if (props.type === "Trap") {
            if (canvas.tokens.get(props.targetID).data.hidden) {
                let chatData = {
                    user:    game.user._id,
                    content: "You sense something is amiss.",
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    spealer: ChatMessage.getSpeaker({ token: actor })
                };

                ChatMessage.create(chatData, {});
            }
        }

        // Handle Items -------------------------------------------------------
        if (props.type === "Item") {
            if (cavnas.tokens.get(props.targetID).data.hidden) {
                let chatData = {
                    user:    game.user._id,
                    content: "You sense something is amiss.",
                    whisper: ChatMessage.getWhisperRecipients(actor.name),
                    spealer: ChatMessage.getSpeaker({ token: actor })
                };

                ChatMessage.create(chatData, {});
            }
        }
    }

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
        name:     "Detect",
        checkDC:  args[0],
        type:     args[1],
        targetID: args[2]
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
