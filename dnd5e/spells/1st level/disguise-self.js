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
if (!(game.modules.get("tokenmagic")?.active)) {
    return ui.notifications.error("Token Magic is required!");
}


// Get folder information -----------------------------------------------------
const actorList = game.folders.contents.find((folder) => {
    return folder.name === props.folderName;
});

if (!actorList) {
    return ui.notifications.error(`Cannot find a folder named ${props.folderName}`);
}

const getActorImages = actorList.contents.reduce((list, target) => {
    console.warn(target, target.prototypeToken.texture.src);

    list += `
        <label class="radio-label">
            <input type="radio" name="disguiseForm" value="${target.prototypeToken.texture.src}" />
            <img src="${target.prototypeToken.texture.src}" style="border: 0; width: 50px; height: 50px;" />
            ${target.name}
        </label>
    `;
    return list;
}, "");

let transformParams;


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

                    console.warn(disguiseImage);

                    transformParams = [{
                        filterType: "polymorph",
                        filterId:   props.itemData.name,
                        type:       props.transitionType,
                        padding:    70,
                        madnify:    1,
                        imagePath:  disguiseImage,
                        animated: {
                            progress: {
                                active:       true,
                                animType:     "halfCosOscillation",
                                val1:         0,
                                val2:         100,
                                loops:        1,
                                loopDuration: 1000
                            }
                        }
                    }];

                    await wait(props.transitionWait);
                    if (props.tokenData.TMFXhasFilterId(props.itemData.name)) {
                        await TokenMagic.deleteFilters(props.tokenData, props.itemData.name);
                    }
                    await wait(props.transitionWait);
                    await TokenMagic.addUpdateFilters(props.tokenData, transformParams);
                }
            }
        }
    }).render(true);
}


// Remove disguise ------------------------------------------------------------
if (props.state === "off") {
    transformParams = [{
        filterType: "polymorph",
        filterId:   props.itemData.name,
        type:       props.transitionType,
        animation: {
            progression: {
                active: true,
                loops:  1
            }
        }
    }];

    await wait(props.transitionWait);
    await TokenMagic.addUpdateFilters(props.tokenData, transformParams);
    await wait(props.transitionWait);
    await TokenMagic.deleteFilters(props.tokenData, props.itemName);
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
