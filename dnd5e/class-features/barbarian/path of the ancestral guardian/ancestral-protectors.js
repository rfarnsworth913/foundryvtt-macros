/* ==========================================================================
    Macro:         Ancestral Protectors
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Ancestral Protectors",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {

    // Reset application tracker ----------------------------------------------
    const hookID = Hooks.on("combatRound", async () => {
        DAE.unsetFlag(props.actorData, "ancestralProtectorsAttack", true);
    });

    DAE.setFlag(props.actorData, "combatRoundHook", hookID);
}

// Cleanup Hooks --------------------------------------------------------------
if (props.state === "off") {
    const combatHookID = DAE.getFlag(props.actorData, "combatRoundHook");
    DAE.unsetFlag(props.actorData, "combatRoundHook");

    Hooks.off("combatRound", combatHookID);
}

if (props.state === "DamageBonus") {

    // Check if actor is raging -----------------------------------------------
    const raging = await getEffect({ actorData: props.actorData, effectLabel: "Rage" });
    if (!raging) {
        return true;
    }

    // Track first attack -----------------------------------------------------
    const firstAttackFlag = DAE.getFlag(props.actorData, "ancestralProtectorsAttack");
    if (!firstAttackFlag) {
        return true;
    }

}

// Track first attack
// Other Browser Content
// Other Browser Content
// Create effect handler
// Other Browser Content
// Other Browser Content
// Apply effect to target
// Other Browser Content
// Other Browser Content
// Target Effect: Handle Attack Disadvantage
// Other Browser Content
// Other Browser Content
// Target Effect: Handle damage resistance
// Other Browser Content
// Other Browser Content
// Character Animations



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
