/* ==========================================================================
    Macro:         Spike Growth
    Source:        Active Auras Compendium
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spike Growth",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for Dependencies -----------------------------------------------------
if (!(game.modules.get("advanced-macros")?.active)) {
    return ui.notifications.error("Advanced Macros is required!");
}

// OnUse Handler --------------------------------------------------------------
if (props.state === "OnUse") {
    AAhelpers.applyTemplate(args);
}

// DAE Handler ----------------------------------------------------------------
if (props.state === "on" || props.state === "each") {
    const damageRoll = await new Roll("2d4[piercing]").evaluate();
    await damageRoll.toMessage({ flavor: "Spike Growth Damage" });

    const targets = new Set();
    const saves   = new Set();

    targets.add(props.tokenData);
    saves.add(props.tokenData);

    await MidiQOL.applyTokenDamage(
        [{
            damage: damageRoll.total,
            type: "piercing"
        }],
        damageRoll.total,
        targets,
        null,
        saves
    );

    const effect = props.actorData.effects.find((item) => {
        return item.data.label === "Spike Growth";
    });
    await effect.delete();
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
