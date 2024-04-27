/* ==========================================================================
    Macro:         Divine Smite
    Source:        https://www.patreon.com/posts/paladin-smite-59149604
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Divine Smite",
    state: args[0]?.tag || args[0] || "unknown",
    macroPass: lastArg.macroPass || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg.item || {},
    tokenData,

    damageType: "radiant",
    creatureTypes: ["undead", "fiend"],

    animations: {
        source: "jb2a.divine_smite.caster.blueyellow",
        target: "jb2a.divine_smite.target.blueyellow"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
const [divineSmite] = await getItems({ actorData: props.actorData, itemLabel: "Divine Smite" });
const itemUpdate = await fromUuidSync(divineSmite.uuid);
const itemData = await itemUpdate.getChatData();
const sourceData = itemData?.source?.book || itemData?.source;
const trigger = (sourceData.toLowerCase() === "all") ? true :
    ((sourceData.toLowerCase() === "crit") && (lastArg.isCritical)) ? true : false;
const weapons = await props.actorData.itemTypes.weapon.filter((weapon) => {
    return weapon.getChatData().weaponType !== "Natural";
}).map((i) => {
    return i.name;
});
const spellCount = Object.values(props.actorData.getRollData().spells).reduce((list, item) => {
    if (item.value > 0) {
        list.push(item.value);
    }

    return list;
}, []);

console.warn(props.itemData.name);
console.warn(props.lastArg.damageRoll.options.type);


// Handle Damage Bonus Condition ----------------------------------------------
if (props.macroPass === "DamageBonus" &&
    props.itemData.name.toLowerCase() !== "divine smite" &&
    props.lastArg.damageRoll.options.type !== "healing" &&
    props.lastArg.damageRoll.options.type !== "temphp" &&
    trigger &&
    spellCount.length > 0) {

    // Check for melee attack ---------------------------------------------
    if (!["mwak"].some((i) => {
        return (props.itemData.system.actionType || "").toLowerCase().includes(i);
    })) {
        return ui.notifications.error("Divine Smite can only be used with melee weapons");
    }

    // eslint-disable-next-line no-async-promise-executor
    return await new Promise(async (resolve) => {
        new Dialog({
            title: "Divine Smite",
            content: "<p>Do you wish to follow up the attack with a Divine Smite?</p>",
            buttons: {
                yes: {
                    label: "Smite!",
                    callback: async () => {
                        return resolve(await divineSmite.use());
                    }
                },
                no: {
                    label: "No",
                    callback: async () => {
                        return resolve(false);
                    }
                }
            },
            default: "No"
        }).render(true);
    });
}

if (props.state === "OnUse" &&
    props.macroPass === "preDamageRoll" &&
    props.itemData.name.toLowerCase() === "divine smite") {
    await updateSmite();
}

// eslint-disable-next-line max-lines-per-function
async function updateSmite () {
    const divineArray = {};
    let targetList = [];

    try {
        const messageHistory = Object.values(MidiQOL.Workflow.workflows).filter((workflow) => {
            return workflow.actor.id === props.actorData.id && (workflow?.attackRoll || workflow?.damageRoll) &&
            weapons.includes(workflow.item?.name);
        });

        if (messageHistory.length === 0) {
            targetList = props.lastArg.targets;
            divineArray.critical = false;
            throw Error("✋ No previous attack Workflow found. Defaulting to Divine Smite's workflow.");
        } else {
            const lastAttack = messageHistory[messageHistory.length - 1];
            targetList = lastAttack.hitTargets;
            divineArray.critical = lastAttack.isCritical ?? false;
        }

        divineArray.targetId = targetList.first().id;
    } catch (error) {
        console.warn(error, divineArray);
    } finally {
        const critArray = {
            critical: divineArray.critical,
            powerfulCritical: game.settings.get("dnd5e", "criticalDamageMaxDice"),
            multiplyNumeric: game.settings.get("dnd5e", "criticalDamageModifiers")
        };

        const target = await canvas.tokens.get(divineArray.targetId);
        const targetData = await target.actor.getRollData();
        const spellLevel = Number(props.lastArg.spellLevel);
        let diceNum = Math.min(5, spellLevel + 1);

        const undead = props.creatureTypes.some((type) => {
            return ((targetData.details?.race) || (targetData.details?.type?.value) || "").toLowerCase().includes(type);
        });

        if (undead) {
            diceNum += 1;
        }

        const damageRoll = await new game.dnd5e.dice.DamageRoll(
            `${diceNum}d8[${props.damageType}]`,
            props.actorData.getRollData(), critArray
        ).evaluate({ async: true });

        const finalData = {
            "Target Id": divineArray.targetId,
            "Target": target,
            "Target Name": target.actor.name,
            "Target Data": targetData,
            "Target Race": (targetData.details?.race) || (targetData.details?.type?.value),
            "Undead": undead,
            "Spell Level": spellLevel,
            "Damage Dice": `${diceNum}d8`,
            "Damage Type": props.damageType,
            "Damage Formula": damageRoll.formula,
            "Critical": critArray.critical
        };

        playAnimation(target);

        console.log("➡️ %cFinal Roll Data:", "background: black; color: #90EE90", finalData);
        itemUpdate.system.damage.parts = [[damageRoll.formula, props.damageType]];
    }
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
 * Returns a collection of items that have the specified label
 *
 * @param    {object}     [options]
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
async function getItems ({ actorData, itemLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified");
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
}

/**
 * Plays the animation for the attack when called
 */
function playAnimation (target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file(props.animations.source)
                .attachTo(props.tokenData)
                .scaleToObject(1.75)
                .fadeIn(300)
                .fadeOut(300)
                .waitUntilFinished()
            .effect()
                .file(props.animations.target)
                .attachTo(target)
                .scaleToObject(1.75)
            .play();
    }
}
