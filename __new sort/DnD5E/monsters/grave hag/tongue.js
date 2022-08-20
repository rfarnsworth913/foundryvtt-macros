/* ==========================================================================
    Macro:         Grave Hag: Tongue
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Grave Hag: Tongue",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    failedSaves: lastArg.failedSaves,
    uuid:        lastArg.uuid,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for valid targets ----------------------------------------------------
if (props.failedSaves.length === 0) {
    return false;
}


// Get required information ---------------------------------------------------
const workflow = MidiQOL.Workflow.getWorkflow(props.uuid);
const saveDC   = 15;
const saveRoll = workflow.saveDisplayData[0].rollTotal || 0;


// Effect ---------------------------------------------------------------------
const effectData = {
    changes: [
        {
            key:      "macro.CE",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    "Poisoned",
            priority: 20
        },
        {
            key:      "macro.CE",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    "Blinded",
            priority: 20
        },
        {
            key:      "flags.midi-qol.OverTime",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    "turn=end,\nsaveAbility=con,\nsaveDC=15,\nlabel=\"Grave Hag Poison\"",
            priority: 20
        }
    ],
    label: "Grave Hag Poison",
    icon:  "icons/svg/poison.svg",
    tint:  "#06b003",
    disabled: false,
    duration: {
        rounds:     10,
        seconds:    60,
        startRound: game.combat ? game.combat.round : 0,
        startTime:  game.time.worldTime
    }
};

if (saveDC - saveRoll >= 5) {
    effectData.changes.push({
        key:      "macro.CE",
        mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
        value:    "Paralyzed",
        priority: 20
    });
}

await props.failedSaves[0].actor.createEmbeddedDocuments("ActiveEffect", [effectData]);


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
