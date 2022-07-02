/* ==========================================================================
    Macro:         Favored Foe
    Source:        https://www.patreon.com/posts/favored-foe-54927796
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Favored Foe",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    hitTargets: lastArg.hitTargets,
    itemData:   lastArg.item,
    isCritical: lastArg.isCritical || false,
    uuid:       lastArg.uuid
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Handle applying Effect -----------------------------------------------------
if (props.state === "OnUse") {
    if (props.hitTargets.length === 0) {
        return false;
    }

    const target = props.hitTargets[0].id;

    if (!props.actorData || !target) {
        console.error("Favored Foe: no token/target selected!");
        return false;
    }

    const effectData = {
        changes: [
            {
                key:      "flags.midi-qol.favoredFoe",
                mode:     5,
                value:    target,
                priority: 20
            },
            {
                key:      "flags.dnd5e.DamageBonusMacro",
                mode:     0,
                value:    `ItemMacro.${props.itemData.name}`,
                priority: 20
            }
        ],
        origin:   props.uuid,
        disabled: false,
        duration: props.itemData.effects[0].duration,
        icon:     props.itemData.img,
        label:    props.itemData.name
    };

    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);
}


// Handle Damage Bonus --------------------------------------------------------
if (props.state === "DamageBonus") {
    const targetID = props.hitTargets[0].id;

    // Check if favored foe has already been triggered
    if (getProperty(props.actorData.data.flags, "midi-qol.AlreadyUsed")) {
        return false;
    }

    // Check if weapon attack
    if (!["mwak", "rwak"].includes(props.itemData.data.actionType)) {
        return false;
    }

    // Check if target is marked
    if (targetID !== getProperty(props.actorData.data.flags, "midi-qol.favoredFoe")) {
        return false;
    }

    const damageType = props.itemData.data.damage.parts[0][1];
    const dice       = props.isCritical ? 2 : 1;
    const duration   = {
        rounds:     null,
        seconds:    1,
        startRound: null,
        startTime:  null,
        startTurn:  null,
        turns:      null
    };

    const effectData = {
        changes: [{
            key:      "flags.midi-qol.AlreadyUsed",
            mode:     5,
            value:    "1",
            priority: 20
        }],
        origin:   props.uuid,
        disabled: false,
        duration,
        label:    "Favored Foe already used this round"
    };
    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

    return {
        damageRoll: `${dice}${props.actorData.data.data.scale.ranger["favored-foe-damage"].slice(1)}[${damageType}]`,
        flavor:     "Favored Foe"
    };
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
