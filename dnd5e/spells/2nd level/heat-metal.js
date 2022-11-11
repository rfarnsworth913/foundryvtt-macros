/* ==========================================================================
    Macro:         Heat Metal
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Heat Metal",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    compendiumID: "shared-compendiums.shared-spells",
    itemLabel:    "Heat Metal (Attack)",

    spellLevel: args[2] || lastArg.spellLevel,
    target:     args[1] ? canvas.tokens.get(args[1]) : lastArg.hitTargets[0],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Setup Tracking -------------------------------------------------------------
if (props.state === "OnUse") {
    const { itemData } = lastArg;
    const effectData = {
        changes: [{
            key:      "macro.itemMacro",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `${props.target.id} ${props.spellLevel}`,
            priority: 20
        }],
        origin: itemData.uuid,
        disabled: false,
        duration: {
            seconds:    60,
            rounds:     10,
            startRound: game.combat ? game.combat.round : 0,
            startTime:  game.time.worldTime
        },
        icon:  itemData.img,
        label: itemData.name
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: props.actorData.uuid,
        effects:   [effectData]
    });
}


// Create Effects -------------------------------------------------------------
if (props.state === "on") {

    // Get source item --------------------------------------------------------
    const compendium = game.packs.get(props.compendiumID);
    const orgItem    = await compendium.getDocuments({ name: props.itemLabel });

    if (orgItem.length === 0) {
        return false;
    }


    // Mutate the item --------------------------------------------------------
    const itemData = duplicate(orgItem[0]);
    itemData.system.damage.parts = [[`${props.spellLevel}d8`, "fire"]];

    // Add item to target -----------------------------------------------------
    const updates = {
        embedded: {
            Item: {
                "Heat Metal (Attack)": {
                    ...itemData
                }
            }
        }
    };

    await warpgate.mutate(props.tokenData.document, updates, {}, {
        name:        props.itemLabel,
        description: `Adding ability: ${props.itemLabel}`
    });

    // Apply tracking effect --------------------------------------------------
    const targetUuid = props.target.actor.uuid;
    const hasEffect  = await game.dfreds.effectInterface.hasEffectApplied("Heat Metal", targetUuid);

    if (!hasEffect) {
        game.dfreds.effectInterface.addEffect({
            effectName: "Heat Metal (Flag)",
            uuid:       targetUuid
        });
    }
}


// Remove Effects -------------------------------------------------------------
if (props.state === "off") {

    // Remove attack from self ------------------------------------------------
    await warpgate.revert(props.tokenData.document, props.itemLabel);

    // Remove condition from any other target(s) ------------------------------
    const targets = canvas.tokens.placeables.filter((token) => {
        return token.actor.effects.find((effect) => {
            return effect.data.label === "Heat Metal (Flag)";
        });
    });

    targets.forEach((target) => {
        const { uuid } = target.actor;

        game.dfreds.effectInterface.removeEffect({
            effectName: "Heat Metal (Flag)",
            uuid
        });
    });
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
