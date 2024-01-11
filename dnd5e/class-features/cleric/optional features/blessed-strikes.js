/* ==========================================================================
    Macro:         Blessed Strikes
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Blessed Strikes",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData || {},
    tokenData,

    abilityID:      "BlessedStrikes",
    allowedTypes:   ["weapon", "spell"],
    animations: {
        source: "jb2a.divine_smite.caster.blueyellow",
        target: "jb2a.divine_smite.target.blueyellow"
    },
    damageDice: 1,
    damageType: CONFIG.DND5E.damageTypes.radiant,

    hitTargets: lastArg.hitTargets,
    spellLevel: lastArg.spellLevel || 0,
    uuid:       lastArg.uuid,

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "DamageBonus") {

    // Validate usage ---------------------------------------------------------
    if (getProperty(props.actorData.flags, `midi-qol.${props.abilityID}Used`)) {
        return {};
    }

    if (!props.allowedTypes.includes(props.itemData.type)) {
        return {};
    }

    if (props.itemData.type === "spell" && props.spellLevel > 0) {
        return {};
    }

    if (props.hitTargets[0].disposition !== CONST.TOKEN_DISPOSITIONS.HOSTILE) {
        return {};
    }

    // Ask for attack augment -------------------------------------------------
    const dialogResult = await Dialog.confirm({
        title:       `Use ${props.name}`,
        content:     `<p>Use ${props.name}?</p>`,
        rejectClose: true
    });

    if (!dialogResult) {
        return {};
    }

    // Create tracking effect data --------------------------------------------
    const effectData = {
        changes: [{
            key:      `flags.midi-qol.${props.abilityID}Used`,
            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value:    "1",
            priority: 20
        }],
        origin:   props.uuid,
        disabled: false,
        duration: {
            seconds: 1
        },
        name: `${props.name} already used this round`,
        icon: "assets/icons/dnd5e/classes/features/cleric/blessed-strikes.webp"
    };

    await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

    playAnimation();

    // Return bonus damage ----------------------------------------------------
    return {
        damageRoll: `${props.damageDice}d8[${props.damageType}]`,
        flavor:     "Blessed Strikes"
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
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}


/**
 * Plays the animation for the attack when called
 */
function playAnimation () {
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
                .attachTo(props.hitTargets[0])
                .scaleToObject(1.75)
            .play();
    }
}
