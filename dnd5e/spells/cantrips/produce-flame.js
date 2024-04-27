/* ==========================================================================
    Macro:         Produce Flame
    Source:        https://www.patreon.com/posts/produce-flame-51998583
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Produce Flame",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.spells-abilities",
    itemLabel: "Produce Flame (Attack)",

    lastArg
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
    const { spellLevel } = props.actorData.getRollData().details;
    const spellDamage = spellLevel < 3 ? 1 :
                        spellLevel < 6 ? 2 :
                        spellLevel < 0 ? 3 : 4;

    const updates = {
        embedded: {
            Item: {
                "Produce Flame (Attack)": {
                    ...itemData,
                    "system.damage.parts": [[`${spellDamage}d8`, "fire"]]
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
    warpgate.revert(props.tokenData.document, props.itemLabel);
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
