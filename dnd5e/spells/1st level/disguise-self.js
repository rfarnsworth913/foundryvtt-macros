/* ==========================================================================
    Macro:         Disguise Self
    Source:        https://www.patreon.com/posts/disguise-self-58480968
    Usage:         Usage
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(args[1]) || {};
const { itemData } = lastArg.efData.flags.dae;

const props = {
    name: "Disguise Self",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || await fromUuidSync(lastArg?.actorUuid) || {},
    itemData,

    itemName: itemData.name,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Setup for the spell --------------------------------------------------------
const actorList = game.folders.contents.find((folder) => {
    return folder.name === props.itemName;
});


const actorImages = [];
actorList.contents.forEach((actorData) => {
    const actorImage = actorData.prototypeToken.texture.src;

    actorImages.push(`
            <label for="${actorData.uuid}" class="radio-label">
            <input type="radio" id="${actorData.uuid}" name="disguiseForm" value="${actorData.uuid}" />
            <img src="${actorImage}" style="border: 0; width: 50px; height: 50;" />
            ${actorData.name}
        </label>
        `);
});


if (props.state === "on") {

    // Exit if the required folder is missing ---------------------------------
    if (!actorList) {
        await wait(1000);
        await removeEffect({ actorData: props.actorData, effectLabel: props.itemName });
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
                    ${actorImages.join("")}
                </div>
            </form>
        `,
        buttons: {
            change: {
                label: "Change",
                callback: async (html) => {
                    const targetActorID = html.find("input[name='disguiseForm']:checked").val();
                    const targetActor = await fromUuidSync(targetActorID);

                    await props.actorData.transformInto(targetActor, {
                        keepAE: false,
                        keepBackgroundAE: true,
                        keepBio: false,
                        keepClass: false,
                        keepClassAE: true,
                        keepEquipmentAE: true,
                        keepFeatAE: true,
                        keepFeats: false,
                        keepItems: false,
                        keepMental: false,
                        keepOriginAE: true,
                        keepOtherOriginAE: true,
                        keepPhysical: false,
                        keepSaves: false,
                        keepSelf: true,
                        keepSkills: false,
                        keepSpellAE: true,
                        keepSpells: false,
                        keepVision: false,
                        mergeSaves: false,
                        mergeSkills: false,
                        renderSheet: true,
                        transformToken: true,
                    });
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
    await props.actorData.revertOriginalForm();

    await wait(1000);
    const newActorData = await fromUuidSync(props.actorData.uuid);
    await removeEffect({ actorData: newActorData, effectLabel: props.itemName });

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
