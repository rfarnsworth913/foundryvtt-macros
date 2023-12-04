/* ==========================================================================
    Macro:         Disguise Self
    Source:        https://www.patreon.com/posts/disguise-self-58480968
    Usage:         Usage
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};
const { itemData } = lastArg.efData.flags.dae;

const props = {
    name: "Disguise Self",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData,
    tokenData,

    itemName:   itemData.name,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for required modules -------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Setup for the spell --------------------------------------------------------
const actorList = game.folders.contents.find((folder) => {
    return folder.name === props.itemName;
});

const actorImages = actorList.contents.reduce((list, actorData) => {
    const actorImage = actorData.prototypeToken.texture.src;

    return list += `
        <label for="${actorData.id}" class="radio-label">
            <input type="radio" id="${actorData.id}" name="disguiseForm" value="${actorImage}" />
            <img src="${actorImage}" style="border: 0; width: 50px; height: 50;" />
            ${actorData.name}
        </label>
    `;
}, "");

if (props.state === "on") {

    // Exit if the required folder is missing ---------------------------------
    if (!actorList) {
        await wait(1000);
        const effect = await getEffect({ actorData: props.actorData, effectLabel: props.itemName });
        await effect.delete();
        return ui.notifications.error(
            `Cannot find folder name ${props.itemName}.  Please create the folder and setup as required.`);
    }

    // Disguise Self Dialog ---------------------------------------------------
    return new Dialog({
        title: `${props.itemName} Configuration`,
        content: `
            <style>
                #disguiseSpell .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                }

                #disguiseSpell .radio-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    justify-content: center;
                    flex: 1 0 25%;
                    line-height: normal;
                }

                #disguiseSpell .radio-label input {
                    display: none;
                }

                #disguiseSpell img {
                    border: 0;
                    width: 50px;
                    height: 50px;
                    flex: 0 0 50px;
                    cursor: pointer;
                }

                #disguiseSpell [type=radio]:checked + img {
                    outline: 2px solid #f00;
                }

            </style>
            <form id="disguiseSpell">
                <div class="form-group">
                    ${actorImages}
                </div>
            </form>
        `,
        buttons: {
            change: {
                label: "Change",
                callback: async (html) => {
                    const disguiseImage = await html.find("input[name='disguiseForm']:checked").val();
                    const tokenSettings = { img: props.actorData.prototypeToken.texture.src };
                    const updates = { "token": { img: disguiseImage } };
                    const callbacks = { delta: async (delta, token) => {
                        return await mergeObject(delta, { token: tokenSettings });
                    }};

                    return await warpgate.mutate(props.tokenData.document, updates, callbacks, { name: props.itemName });
                }
            },
            cancel: {
                label: "Cancel",
                callback: async () => {
                    await removeEffect({ actorData: props.actorData, effectLabel: props.itemName });
                }
            }
        },
        default: "Cancel"
    }).render(true);
}

if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, props.itemName);

    return ChatMessage.create({
        content: `${props.itemName} wears off!`,
        speaker: ChatMessage.getSpeaker({ actor: props.actorData })
    });
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

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}
