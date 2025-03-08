// Dialog Formatting
// Get user selection
// Apply multipliers
// Get monsters from compendium
// Generate Dialog Box
// Dialog Formatting
// Handle user selection
// Summoning logic
// Summoning Animation
// Unsummoning logic
// Unsummoning Animation

/* ==========================================================================
    Macro:         Conjure Animals
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Conjure Animals",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    summonOptions: {
        dialogValues: [
            { text: "One beast of challenge rating 2 or lower", summonCounty: 1, cr: 2 },
            { text: "Two beasts of challenge rating 1 or lower", summonCounty: 2, cr: 1 },
            { text: "Four beasts of challenge rating 1/2 or lower", summonCounty: 4, cr: 0.5 },
            { text: "Eight beasts of challenge rating 1/4 or lower", summonCounty: 8, cr: 0.25 },
        ]
    },

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("portal-lib")?.active)) {
    return ui.notifications.error("Portal Library is required!");
}

// Summon Handler -------------------------------------------------------------
if (props.state === "on") {

    // Generate Dialog Box Content --------------------------------------------
    const dialogContent = props.summonOptions.dialogValues.map((option, index) => {
        return `
            <label for="${index}" class="radio-label">
                <input type="radio" id="${index}" name="summonForm" value="${index}" />
                ${option.text}
            </label>
        `;
    }).join("");

    console.warn(dialogContent);

    // Summon Dialog Box ------------------------------------------------------
    return new Dialog({
        title: `${props.name} - Summon Options`,
        content: `
            <style>
                #summonSpell .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                    max-height: 400px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    margin-bottom: 15px;
                }

                #summonSpell .radio-label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    text-align: center;
                    justify-content: flex-start;
                    flex: 0 0 100%;
                    line-height: normal;
                    padding: 5px;
                    cursor: pointer;
                }
            </style>
            <form id="summonSpell">
                <div class="form-group">
                    ${dialogContent}
                </div>
            </form>
        `,
        buttons: {
            summon: {
                label: "Summon",
                callback: async (html) => {
                    const selectedIndex = await html.find("input[name='summonForm']:checked").val();
                    console.warn(selectedIndex);
                }
            },
            cancel: {
                label: "Cancel",
                callback: async () => {
                    await removeEffect({
                        actorData: props.actorData,
                        effectLabel: props.itemData.name
                    });
                }
            }
        },
        default: "Cancel"
    }).render(true);

}

// Unsummon Handler -----------------------------------------------------------
if (props.state === "off") {

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
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
