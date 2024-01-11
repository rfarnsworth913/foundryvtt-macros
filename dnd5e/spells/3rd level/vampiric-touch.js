/* ==========================================================================
    Macro:         Vampiric Touch
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Vampiric Touch",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    itemLabel: "Vampiric Touch (Attack)",
    spellLevel: args[1] || 3,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (props.state === "on") {

    // Get source item --------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const orgItem = await compendium.getDocuments({ name: props.itemLabel });

    if (orgItem.length === 0) {
        return false;
    }


    // Mutate the item --------------------------------------------------------
    const itemData = duplicate(orgItem[0]);


    // Add item to target -----------------------------------------------------
    const updates = {
        embedded: {
            Item: {
                "Vampiric Touch (Attack)": {
                    ...itemData,
                    "system.damage.parts": [[`${props.spellLevel}d6`, "necrotic"]]
                }
            }
        }
    };

    await warpgate.mutate(props.tokenData.document, updates, {}, {
        name: props.itemLabel,
        description: `Adding ability: ${props.itemLabel}`
    });
}

if (props.state === "off") {
    await warpgate.revert(props.tokenData.document, props.itemLabel);
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
