/* ==========================================================================
    Macro:         Harness Divine Power
    Source:        https://www.patreon.com/posts/harness-divine-53855097
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Harness Divine Power",
    state: args[0]?.tag || args[0] || "unknown",

    actorData:  tokenData?.actor || {},
    itemData:   lastArg.item,
    itemCardID: lastArg.itemCardId,
    tokenData,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.actorData.data.data.spells.spell1.max === 0) {
    return ui.notifications.error(`No spell slots found on ${props.actorData.name}`);
}


// Handle spell refunds -------------------------------------------------------
const rollData   = await props.actorData.getRollData();
const prof       = Math.ceil(rollData.prof / 2);
let inputContent = "";

if (hasAvailableSlots(props.actorData)) {

    // Get options for available slots
    for (let i = 1; i <= prof; i++) {
        const chosenSpellSlots = getSpellSlots(props.actorData, i);
        const minSlots         = chosenSpellSlots.value;
        const maxSlots         = chosenSpellSlots.max;

        if (minSlots < maxSlots) {
            inputContent += `
                <div class="form-group">
                    <label for="spell${i}">
                        Spell Slot Level ${i} [${minSlots}/${maxSlots}]
                    </label>
                    <input id="spell${i}" name="spellSlot" value="${i}" type="radio" />
                </div>
            `;
        }
    }
}

new Dialog ({
    title: props.itemData.name,
    content: `
        <form>
            <p>Choose 1 spell slot to restore</p>
            <hr />
            ${inputContent}
        </form>
    `,
    buttons: {
        recover: {
            icon:  "<i class=\"fas fa-check\"></i>",
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

                spellRefund(props.actorData, slot);
                let rollResults     = `<div>Regains 1 spell slot, Level ${num}.</div>`;
                const chatMessage   = game.messages.get(props.itemCardID);
                let content         = duplicate(chatMessage.data.content);
                const searchString  = /<div class="midi-qol-saves-display">[\\s\\S]*<div class="end-midi-qol-saves-display">/g;
                const replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${rollResults}`;
                content             = content.replace(searchString, replaceString);
                chatMessage.update({ content });
            }
        }
    }
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

async function spellRefund (actorData, slot) {
    let actor_data = duplicate(actorData.data._source);
    actor_data.data.spells[slot].value = actor_data.data.spells[slot].value + 1;
    await actorData.update(actor_data);
}

function getSpellSlots (actorData, level) {
    return actorData.data.data.spells[`spell${level}`];
}

function hasAvailableSlots (actorData) {
    for (let slot in actorData.data.data.spells) {
        if (actorData.data.data.spells[slot].value < actorData.data.data.spells[slot].max) {
            return true;
        }
    }

    return false;
}
