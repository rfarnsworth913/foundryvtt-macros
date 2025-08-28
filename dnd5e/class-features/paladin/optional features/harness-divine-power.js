/* ==========================================================================
    Macro:         Harness Divine Power
    Source:        https://www.patreon.com/posts/harness-divine-53855097
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Harness Divine Power",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    itemData: lastArg.item,
    itemCardID: lastArg.itemCardUuid,
    tokenData: await fromUuidSync("Actor.c5qgnS1q7kcH0oTn.Item.WmSOF7AUjHySey36"),

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.actorData.system.spells.spell1.max === 0) {
    return ui.notifications.error(`No spell slots found on ${props.actorData.name}`);
}


// Handle spell refunds -------------------------------------------------------
const rollData = await props.actorData.getRollData();
const prof = Math.ceil(rollData.prof / 2);
let inputContent = "";

if (hasAvailableSlots(props.actorData)) {

    // Get options for available slots
    for (let i = 1; i <= prof; i++) {
        const chosenSpellSlots = getSpellSlots(props.actorData, i);
        const minSlots = chosenSpellSlots.value;
        const maxSlots = chosenSpellSlots.max;

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

new Dialog({
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
            icon: "<i class=\"fas fa-check\"></i>",
            label: "Recover",
            callback: async (html) => {
                const selectedSlot = await html.find("input[name=\"spellSlot\"]:checked");
                let slot = "";
                let num = "";

                for (let i = 0; i < selectedSlot.length; i++) {
                    slot = selectedSlot[i].id;
                    num = selectedSlot[i].value;
                }

                if (slot === "") {
                    return ui.notifications.warn("The ability fails, not spell slot was selected");
                }

                spellRefund(props.actorData, slot);
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
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Handles refunding the spell slot to the correct spell level
 *
 * @param  {Actor5e}  actorData  Actor to be updated
 * @param  {number}   slot       Spell level to be updated
 */
async function spellRefund (actorData, slot) {
    const dActorData = foundry.utils.duplicate(actorData._source);
    dActorData.system.spells[slot].value = dActorData.system.spells[slot].value + 1;
    await actorData.update(dActorData);
}

/**
 * Returns the number of spell slots for the given spell level
 *
 * @param    {Actor5e}  actorData  Actor to be operated on
 * @param    {number}   level      Spell level to look up
 * @returns  {number}              Number of spell slots for specified level
 */
function getSpellSlots (actorData, level) {
    return actorData.system.spells[`spell${level}`];
}

/**
 * Checks for available spell slots
 *
 * @param    {Actor5e}  actorData  Actor to check for spell slots
 * @returns  {boolean}             Status of spell slots
 */
function hasAvailableSlots (actorData) {
    for (const slot in actorData.system.spells) {
        if (actorData.system.spells[slot].value < actorData.system.spells[slot].max) {
            return true;
        }
    }

    return false;
}
