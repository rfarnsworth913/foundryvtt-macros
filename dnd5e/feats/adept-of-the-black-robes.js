/* ==========================================================================
    Macro:         Adept of the Black Robes
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Adept of the Black Robes",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData: lastArg?.itemData || {},
    tokenData,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus" && props.itemData?.type === "spell") {

    // Get Hit Dice and spell information
    const { spellLevel } = lastArg;
    let availableHitDice = 0;
    const hitDiceData = [];
    const damageType = props.itemData.system.damage.parts[0][1];

    Object.keys(props.actorData.getRollData().classes).forEach((className) => {
        const characterClass = props.actorData.getRollData().classes[className];
        const { levels } = characterClass;

        availableHitDice += levels - characterClass.hitDiceUsed;
        hitDiceData.push({
            className: className,
            hitDice: characterClass.hitDice,
            hitDiceAvailable: levels - characterClass.hitDiceUsed,
            totalHitDice: levels
        });
    });

    // Continue processing if we have Hit Dice available to cover the spell
    if (spellLevel > 0 && availableHitDice >= spellLevel) {

        // Confirm Hit Dice usage with player
        const dialogResult = await Dialog.confirm({
            title: `${props.name} Life Channel`,
            content: "Use Hit Points to enhance spell damage?",
            defaultYes: false
        });

        if (!dialogResult) {
            return {};
        }

        // Calculate damage and update used Hit Dice
        let hitDice = "";
        let remainingSpellLevel = spellLevel;

        hitDiceData.forEach(async (data) => {
            if (remainingSpellLevel > 0) {
                remainingSpellLevel -= data.hitDiceAvailable;

                if (hitDice === "") {
                    hitDice = data.hitDice;
                }

                const classData = props.actorData.classes[data.className];
                classData.update({
                    "system.hitDiceUsed": Math.clamped(classData.system.hitDiceUsed + spellLevel, 0, data.totalHitDice)
                });
            }
        });

        return {
            damageRoll: `${spellLevel}${hitDice}[${damageType}]`,
            flavor: "Life Channel Damage Bonus"
        };
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
