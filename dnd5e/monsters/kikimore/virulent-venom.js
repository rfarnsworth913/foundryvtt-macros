/* ==========================================================================
    Macro:         Virulent Venom
    Source:        Custom
    Usage:         Damage Bonus Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Virulent Venom",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,
    tokenData,

    damageDetail: lastArg.damageDetail,
    targets:      lastArg.hitTargets,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    props.targets.forEach(async (target) => {

        // Check for immunity and resistance ----------------------------------
        const resistance = getConditionStatus(target.actor.system.traits.dr.value);
        const immunity   = getConditionStatus(target.actor.system.traits.di.value);

        if (immunity) {
            return console.info("Target is immune to poison damage");
        }

        // Calculate damage ---------------------------------------------------
        let poisonDamage = 0;

        props.damageDetail.forEach((damagePart) => {
            if (damagePart.type === "poison") {
                poisonDamage += damagePart.damage;
            }
        });

        if (resistance) {
            poisonDamage = Math.floor(poisonDamage / 2);
        }

        // Apply effect to target ---------------------------------------------
        const effectData = {
            changes: [{
                key:      "system.attributes.hp.max",
                value:    `-${poisonDamage}`,
                mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                priority: 20
            }],
            flags: {
                dae: {
                    stackable: "multi",
                    specialDuration: [
                        "longRest",
                        "shortRest"
                    ]
                }
            },
            label:  props.name,
            icon:   "icons/magic/acid/dissolve-drip-droplet-smoke.webp",
            origin: props.lastArg.uuid,
            disabled: false
        };

        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: target.actor.uuid,
            effects:   [effectData]
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

/**
 * Checks if the target has the protection that is specified
 *
 * @param    {*} data
 * @param    {string} [condition="poison"]
 * @returns  {array}
 */
function getConditionStatus (data, condition = "poison") {
    const exists = data.filter((value) => {
        return value === condition;
    }) || [];

    return exists.length > 0;
}
