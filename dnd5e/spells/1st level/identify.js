/* ==========================================================================
    Macro:         Identify
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Identify",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("forien-unidentified-items")?.active)) {
    return ui.notifications.error("Forien Unidentified Items is required!");
}


// Get items ------------------------------------------------------------------
const items = [];

props.actorData.items.forEach((item) => {
    if (item?.isMystified()) {
        items.push(item);
    }
});

if (items.length === 0) {
    return ui.notifications.error(`No items were found in ${props.actorData.name} inventory!`);
}


// Create Dialog --------------------------------------------------------------
let content = "";

items.forEach((item) => {
    content += `
        <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
            <input type="radio" id="${item.uuid}" name="enhancedItem" ${content.length === 0 ? "checked" : ""} />
            <img src="${item.img}" height="30px" width="30px" style="margin-left: 7px; margin-right: 7px; alt=${item.name} />
            <label for="${item.name}">${item.name}</label>
        </div>
    `;
});

new Dialog({
    title: "Identify Item",
    content: `
        <form class="flexcol">
            <fieldset style="border: none;">
                ${content}
            </fieldset>
        </form>
    `,
    buttons: {
        identify: {
            icon:  "<i class=\"fas fa-check\"></i>",
            label: "Identify",
            callback: async (html) => {
                const selectedItem = html.find("input:checked")?.[0];
                const item         = fromUuid(selectedItem.id);
                ForienIdentification.identify(item);
                item.sheet.render(true);
            }
        },
        cancel: {
            icon:  "<i class=\"fas fa-times\"></i>",
            label: "Cancel"
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
