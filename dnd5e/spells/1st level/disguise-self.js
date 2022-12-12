/* ==========================================================================
    Macro:         Disguise Self
    Source:        https://www.patreon.com/posts/disguise-self-58480968
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Disguise Self",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.efData.flags.dae.itemData,
    tokenData,

    folderName:     "Disguise Self",
    transitionType: 6,
    transitionWait: 300,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}


// Get folder information -----------------------------------------------------
const actorList = game.folders.contents.find((folder) => {
    return folder.name === props.folderName;
});

if (!actorList) {
    return ui.notifications.error(`Cannot find a folder named ${props.folderName}`);
}

const getActorImages = actorList.contents.reduce((list, target) => {
    list += `
        <label class="radio-label">
            <input type="radio" name="disguiseForm" value="${target.prototypeToken.texture.src}" />
            <img src="${target.prototypeToken.texture.src}" style="border: 0; width: 50px; height: 50px;" />
            ${target.name}
        </label>
    `;
    return list;
}, "");


// Apply disguise -------------------------------------------------------------
if (props.state === "on") {
    new Dialog({
        title: props.itemData.name,
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
                    justify-items: center;
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
                    ${getActorImages}
                </div>
            </form>
        `,
        buttons: {
            change: {
                label: "Change",
                callback: async (html) => {
                    const [disguise] = html.find("input[type='radio'][name='disguiseForm']:checked");
                    const disguiseImage = disguise.value;

                    const updates = {
                        token: {
                            "texture.src": disguiseImage
                        }
                    };

                    await warpgate.mutate(props.tokenData.document, updates, {}, { name: props.itemData.name });
                }
            }
        }
    }).render(true);
}


// Remove disguise ------------------------------------------------------------
if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, props.itemData.name);
    ChatMessage.create({
        content: `${props.itemData.name} wears off`,
        speaker: ChatMessage.getSpeaker({
            actor: props.actorData
        })
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
