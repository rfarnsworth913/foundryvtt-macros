/* ==========================================================================
    Macro:         Absorb Elements
    Source:        https://www.patreon.com/posts/absorb-elements-57262074
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Absorb Elements",
    state: args[0]?.tag || args[0] || "unknown",

    actorData:  tokenData?.actor || {},
    itemData:   lastArg.item || {},
    spellLevel: lastArg.spellLevel || 1,
    tokenData,

    elements: {
        acid:      "acid",
        cold:      "cold",
        fire:      "fire",
        lightning: "lightning",
        thunder:   "thunder"
    }
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Get message history ----------------------------------------------------
const messageHistory = game.messages.reduce((list, message) => {
    const damage = message.data.flags?.midiqol?.undoDamage;
    if (damage) {
        list.push(damage);
    }

    return list;
}, []);

// Get attack information -------------------------------------------------
const lastAttack = messageHistory[messageHistory.length - 1];
const attackData = lastAttack.find((target) => {
    return target.tokenId === props.tokenData.id;
});
const damageType = attackData.damageItem.damageDetail[0][0].type;
const type       = props.elements[damageType];

// Handle spell effect(s) -------------------------------------------------
if (!type || type === null) {
    return ui.notifications.error(`The spell fizzles, ${CONFIG.DND5E.damageTypes[damageType]} is not an element`);
}

const gameRound = game.combat ? game.combat.rounds : 0;
const timeData  = props.itemData.data.duration.value;

const effectData = [{
    label: props.itemData.name,
    icon:  props.itemData.img,
    changes: [
        {
            key:      "data.bonuses.mwak.damage",
            mode:     2,
            value:    `${props.spellLevel}d6[${damageType}]`,
            priority: 20
        },
        {
            key:      "data.bonuses.msak.damage",
            mode:     2,
            value:    `${props.spellLevel}d6[${damageType}]`,
            priority: 20
        },
        {
            key:      "data.traits.dr.value",
            mode:     2,
            value:    `${damageType}`,
            priority: 20
        }
    ],
    origin: props.lastArg.uuid,
    disabled: false,
    duration: {
        rounds:     timeData,
        seconds:    timeData * 6,
        startTime:  game.time.worldTime,
        startRound: gameRound
    },
    flags: {
        dae: {
            specialDuration: ["1Attack:mwak", "1Attack:msak"]
        }
    }
}];

await props.tokenData.actor.createEmbeddedDocuments("ActiveEffect", effectData);


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
