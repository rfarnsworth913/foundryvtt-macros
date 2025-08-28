/* ==========================================================================
    Macro:         Cleansing Touch
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Cleansing Touch",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actorData || {},
    itemData: lastArg.itemData || {},
    targetData: lastArg.targets[0]?.actor || {},

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Get effects and determine if any are spells --------------------------------
const spellEffects = [];
const effects = props.targetData.effects || [];

await effects.forEach(async (effect) => {
    const source = await fromUuidSync(effect.origin);

    if (source.type === "spell" || source.name.includes("Concentrating")) {
        spellEffects.push(effect);
    }
});

if (spellEffects.length === 0) {
    ui.notifications.warn(`${props.targetData.name}: No spell effects found to remove.`);
    return false;
}


// Generate dialog content list ---------------------------------------------
const dialogContent = [];

spellEffects.forEach((effect) => {
    dialogContent.push(`
        <label for="${effect.name}" class="radio-label">
            <input type="radio" name="cleansingTouch" id="${effect.uuid}" value="${effect.uuid}" />
            <img src="${effect.img}" style="border: 0; width: 25px; height: 25px;" />
            <span>${effect.name}</span>
        </label>`);
});


// Render dialog -------------------------------------------------------------
new Dialog({
    title: props.name,
    content: `
        <style>
            #cleansingTouch .form-group {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                align-items: flex-start;
                max-height: 400px;
                margin-bottom: 15px;
            }

            #cleansingTouch .radio-label {
                display: flex;
                flex-direction: row;
                align-items: center;
                text-align: center;
                justify-content: flex-start;
                flex: 0 0 100%;
                line-height: normal;
                padding: 5px;
            }

            #cleansingTouch img {
                margin: 0 0.5rem;
            }
        </style>
        <form id="cleansingTouch">
            <hr />
            <div class="form-group">
                ${dialogContent.join("")}
            </div>
        </form>
    `,
    buttons: {
        cleanse: {
            label: "Cleanse Effect",
            callback: async (html) => {
                const selectedEffectUuid = await html.find("input[name='cleansingTouch']:checked").val();

                if (!selectedEffectUuid) {
                    refundItemUse();
                    return false;
                }

                const effect = await fromUuidSync(selectedEffectUuid);
                await removeEffect({
                    actorData: props.targetData,
                    effect
                });
            }
        },

        cancel: {
            label: "Cancel",
            callback: () => {
                refundItemUse();
            }
        }
    }
}).render(true);


function refundItemUse () {
    const item = fromUuidSync(props.itemData.uuid);

    item.update({
        "system.uses.spent": props.itemData.system.uses.spent - 1
    });
    ui.notifications.info(`${props.actorData.name}: Cleansing Touch cancelled.`);
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
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effect } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects: [effect.id]
    });
}
