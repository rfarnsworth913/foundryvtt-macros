/* ==========================================================================
    Macro:         Dragon's Breath
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Dragon's Breath",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    spellLevel:   args[1] || 2,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Handle adding the item to the actor ----------------------------------------
if (props.state === "on") {

    // Get source item(s) ------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const documents  = await compendium.getDocuments();
    const items      = documents.filter((item) => {
        return item.name.includes("Dragon's Breath");
    }).sort((a, b) => {
        return ((a.name > b.name) ? 1 : -1);
    });

    // Create selection dialog ------------------------------------------------
    const options = items.reduce((acc, item) => {
        return acc += `
            <label for="${item.id}" class="radio-label">
                <input type="radio" id="${item.id}" name="item" value="${item.name}">
                ${item.name}
            </label>
        `;
    }, "");

    const menu = await new Dialog({
        title: props.name,
        content: `
            <style>
                #dragonsBreath .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                    max-height: 400px;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    margin-bottom: 15px;
                }

                #dragonsBreath .radio-label {
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

                #dragonsBreath input[type="radio"] {
                    margin-right: 7px;
                    position: initial;
                }
            </style>
            <form id="dragonsBreath">
                <div>
                    <p>Select the type of dragon's breath to bestow:</p>
                </div>
                <hr />
                <div class="form-group">
                    ${options}
                </div>
            </form>
        `,
        buttons: {
            apply: {
                label: "Apply",
                callback: async (html) => {

                    // Get source item ----------------------------------------
                    const itemName = html.find("input[name=\"item\"]:checked").val();
                    const orgItem  = await compendium.getDocuments({ name: itemName });
                    if (orgItem.length === 0) {
                        return ui.notifications.error(`${itemName} cannot be found!`);
                    }

                    // Mutate the item ----------------------------------------
                    const itemData = duplicate(orgItem[0]);
                    const updates  = {
                        embedded: {
                            Item: {
                                [itemName]: {
                                    ...itemData,
                                    "system.damage.parts": [[`${props.spellLevel + 1}d6`, orgItem[0].system.damage.parts[0][1]]]
                                }
                            }
                        }
                    };

                    await warpgate.mutate(props.tokenData.document, updates, {}, {
                        name: props.name,
                        description: `Adding ability: ${itemName}`
                    });
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {
                    return false;
                }
            }
        },
        default: "Cancel"
    });

    return menu.render(true);
}


if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, props.name);
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
