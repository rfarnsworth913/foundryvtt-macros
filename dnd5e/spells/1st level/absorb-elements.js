/* ==========================================================================
    Macro:         Absorb Elements
    Source:        MidiQOL
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Absorb Elements",
    state: args[0]?.tag || args[0] || "unknown",

    spellLevel: lastArg?.spellLevel || 1,

    actorData: lastArg?.actor || {},
    itemData: lastArg?.itemData || {},

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {
    const dialog = new Promise((resolve) => {
        new Dialog({
            title: "Absorb Elements",
            content: `
                <form class="flexcol">
                    <div class="form-group">
                        <select id="element">
                            <option value="acid">Acid</option>
                            <option value="cold">Cold</option>
                            <option value="fire">Fire</option>
                            <option value="lightning">Lightning</option>
                            <option value="thunder">Thunder</option>
                        </select>
                    </div>
                </form>
            `,
            buttons: {
                apply: {
                    icon: "<i class=\"fas fa- bolt\"></i>",
                    label: "Apply",
                    callback: async (html) => {
                        const element = html.find("#element").val();
                        const effect = await getEffect({ actorData: props.actorData, effectLabel: `${props.name}` });
                        const resistance = await getEffect({ actorData: props.actorData, effectLabel: `${props.name} Resistance` });

                        let changes = foundry.utils.duplicate(effect.changes);
                        changes[0].value = `${Math.max(1, props.spellLevel)}d6[${element}]`;
                        changes[1].value = `${Math.max(1, props.spellLevel)}d6[${element}]`;
                        await effect.update({ changes });

                        changes = foundry.utils.duplicate(resistance.changes);
                        changes[0].value = element;
                        await resistance.update({ changes });

                        resolve();
                    }
                },
                cancel: {
                    label: "Cancel",
                    callback: () => resolve(false)
                }
            }
        }).render(true);
    });

    await dialog;
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
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    }));
}
