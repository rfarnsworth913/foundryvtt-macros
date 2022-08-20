/* eslint-disable no-await-in-loop */
/* ==========================================================================
    Macro:         Light
    Source:        https://www.patreon.com/posts/light-69533664
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg    = args[args.length - 1];
const tokenData  = canvas.tokens.get(lastArg?.tokenId) || {};
const casterData = canvas.tokens.get(args[1]);

const props = {
    name: "Light",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    casterData,
    casterDisposition: casterData.data.disposition,
    itemData:          await fromUuid(lastArg.origin),
    saveDC:            casterData.actor.getRollData().attributes.spelldc,
    spellCasting:      casterData.actor.getRollData().attributes.spellcasting,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Setup check(s) ---------------------------------------------------------
    const saveType = "dex";
    let saveResult = "saves";
    let results    = `
        <div class="midi-qol-flex-container">
            hits
            <div class="midi-qol-target-npc midi-qol-target-name" id="${props.tokenData.id}">
                ${props.tokenData.name}
            </div>
            <div>
                <img src="${props.tokenData.data.img}" width="30" height="30" style="border:0px">
            </div>
        </div>
    `;
    let saveResults = `
        <div>
            <div class="midi-qol-nobox">
                ${results}
            </div>
        </div>
    `;


    // Check token disposition ------------------------------------------------
    if (props.tokenData.data.disposition !== props.casterDisposition) {
        const save = await MidiQOL.socket().executeAsGM("rollAbility", {
            request: "save",
            targetUuid: props.actorData.uuid,
            ability: saveType,
            options: {
                chatMessage: false,
                fastForward: false
            }
        });

        if (save.total < props.saveDC) {
            saveResult = "fails";
            await removeAll();
        } else {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: props.tokenData.actor.uuid,
                effects:   [props.tokenData.actor.effects.find((effect) => {
                    return effect.data.label === props.itemData.name;
                }).id]
            });
        }

        results = `
            <div class="midi-qol-flex-container">
                <div class="midi-qol-target-npc midi-qol-target-name" id="${props.tokenData.id}">
                    ${props.tokenData.name} ${saveResult} with ${save.total}
                </div>
                <div>
                    <img src="${props.tokenData.data.img}" width="30" height="30" style="border:0px">
                </div>
            </div>
        `;
        saveResults = `
            <div class="midi-qol-nobox midi-qol-bigger-text">
                ${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${props.saveDC}
            </div>
            <div>
                <div class="midi-qol-nobox">${results}</div>
            </div>
        `;
    } else {
        removeAll();
    }


    // Update Chat with Results -----------------------------------------------
    const lastMessage = game.messages.filter((message) => {
        return message.data.flavor === props.itemData.name &&
            message.data.speaker.token === props.casterData.id;
    }).pop();

    const chatMessage = await game.messages.get(lastMessage.id);
    let content       = await duplicate(chatMessage.data.content);

    const searchString  = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${saveResults}`;

    content = await content.replace(searchString, replaceString);
    await chatMessage.update({
        content
    });

    await ui.chat.scrollBottom();
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


/**
 * Removes the specified effect from all targets
 */
async function removeAll () {
    const targets = canvas.tokens.placeables.filter((placeable) => {
        return placeable.id !== props.tokenData.id &&
            placeable.actor.effects.find((effect) => {
                return effect.data.label === props.itemData.name;
            });
    });

    if (targets.length === 0) {
        return false;
    }

    for (const target of targets) {
        if (props.casterData.actor.id === await getProperty(target.actor.data.flags, "midi-qol.light.owner")) {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: target.actor.uuid,
                effects:   [target.actor.effects.find((effect) => {
                    return (effect.data.label === props.itemData.name);
                }).id]
            });
        }
    }
}
