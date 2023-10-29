/* ==========================================================================
    Macro:         Blade Flourish
    Source:        Cymric (https://gitlab.com/cymric)
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blade Flourish",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,
    itemData: await fromUuid(lastArg.itemUuid).getChatData(),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */


if (props.state === "DamageBonus") {

    // Check if the item has an attack roll
    if (!["ak"].some((actionType) => {
        return (props.itemData.actionType || "").includes(actionType);
    })) {
        return console.error(props.name, `This item ${props.itemData.name} does not contain an attack roll`, "skipping");
    }

    const gameRound = game.combat ? game.combat.round : 0;
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
 * Handles attempting to find a resource, and returning it
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @returns  {Promise<any>}       Actor update handler
 */
async function getResource ({ actorData, resource = "" } = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    const { resources } = actorData.toObject().system;
    const [key]         = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    return resources[key];
}
