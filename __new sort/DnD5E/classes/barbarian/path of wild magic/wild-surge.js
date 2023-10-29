/* ==========================================================================
    Macro:         Add Character Ability
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Add Character Ability",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.shared-class-features",
    itemLabel:    "",

    selectedAbility: args[1] ?? -1,
    wildSurgeAbilities: [
        "Wild Surge (Shadowy Tendrils)",
        "Wild Surge (Teleport)",
        "Wild Surge (Summon Pixie)",
        "Wild Surge (Enchant Weapon)",
        "Wild Surge (Retribution)",
        "Wild Surge (Armor Bonus)",
        "Wild Surge (Difficult Terrain)",
        "Wild Surge (Bolt of Light)"
    ],

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

    // Determine Ability ------------------------------------------------------
    props.itemLabel = props.wildSurgeAbilities[props.selectedAbility - 1];


    // Get source item --------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const orgItem    = await compendium.getDocuments({ name: props.itemLabel });

    if (orgItem.length === 0) {
        return false;
    }


    // Mutate the item --------------------------------------------------------
    const itemData = duplicate(orgItem[0]);


    // Add item to target -----------------------------------------------------
    const updates = {
        embedded: {
            Item: {
                "Wild Surge (Ability)": {
                    ...itemData
                }
            }
        }
    };

    await warpgate.mutate(props.tokenData.document, updates, {}, {
        name:        props.itemLabel,
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
