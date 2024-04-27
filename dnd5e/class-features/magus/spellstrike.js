/* ==========================================================================
    Macro:         Spellstrike
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spellstrike",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    spellLevel: lastArg.spellLevel || 0,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "OnUse") {
    console.warn("Spellstrike: OnUse");
    // Other Content
    // Setup test spells
    // Other Content
    // Get spells from the actor
    // Other Content
    // Select spell to use
    // Other Content
    // Create damage bonus handler
}

if (props.state === "DamageBonus") {
    console.warn("Spellstrike: DamageBonus");
    // Other Content
    // Handle area of effect modifications
    // Other Content
    // Handle cantrips
    // Other Content
    // Handle concentration
    // Other Content
    // Handle saving throws
    // Other Content
    // Handle spell attacks
    // Other Content
    // Finalize ability
    // Other Content
    // Animations
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
