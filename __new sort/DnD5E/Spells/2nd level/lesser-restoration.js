/* ==========================================================================
    Macro:         Lesser Restoration
    Source:        https://www.patreon.com/posts/lesser-57539886
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];

const props = {
    name: "Lesser Restoration",
    state: args[0]?.tag || args[0] || "unknown",

    itemCardId: lastArg.itemCardId,
    target:     canvas.tokens.get(lastArg.targets[0].id),

    conditions: [
        "Blinded",
        "Deafened",
        "Paralyzed",
        "Poisoned"
    ]
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Get Effects on the target Actor --------------------------------------------
const effects = props.target.actor.effects.filter((effect) => {
    const changes = effect.changes.filter((change) => {
        return props.conditions.includes(change.value.replace("(CE)", "").trim());
    });

    return changes.length > 0 || props.conditions.includes(effect.label) ? true : false;
});

const selectOptions = effects.reduce((list, activeEffect) => {
    const condition = activeEffect.label;
    list.push(`<option value="${condition}">${condition}</option>`);
    return list;
}, []);


// Check for conditions -------------------------------------------------------
if (selectOptions.length === 0) {
    return ui.notifications.error(`Nothing happens...There's nothing to Cure on ${props.target.name}`);
}


// Create Dialog and Handle Cure ----------------------------------------------
new Dialog({
    title: `Lesser Restoration: ${props.target.name}`,
    content: `
        <form class="flexcol">
            <div class="form-group">
                <select id="element">
                    ${selectOptions.join("")}
                </select>
            </div>
        </form>
    `,
    buttons: {
        yes: {
            icon:  "<ciass=\"fas fa-check\"></i>",
            label: "Remove it!",
            callback: async (html) => {
                const element = html.find("#element").val();
                const effect  = props.target.actor.effects.find((item) => {
                    return item.label === element;
                });

                await MidiQOL.socket().executeAsGM("removeEffects", {
                    actorUuid: props.target.actor.uuid,
                    effects:   [effect.id]
                });

                const chatMessage = game.messages.get(props.itemCardId);
                const chatContent = `
                    <div class="midi-qol-nobox">
                        <div class="midi-qol-flex-container">
                            <div>Cures ${element}:</div>
                            <div class="midi-qol-target-npc midi-qol-target-name" id="${props.target._id}">
                                ${props.target.name}
                            </div>
                            <div>
                                <img src="${props.target.mesh.document.texture.src}" width="30" height="30" style="border:0px"></img>
                            </div>
                        </div>
                    </div>
                `;

                let content         = duplicate(chatMessage.content);
                const searchString  = /<div class="midi-qol-hits-display">[\\s\\S]*<div class="end-midi-qol-hits-display">/g;
                const replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${chatContent}`;

                content = content.replace(searchString, replaceString);
                chatMessage.update({ content });
                ui.chat.scrollBottom();
            }
        }
    },
    default: "yes"
}).render(true);


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
