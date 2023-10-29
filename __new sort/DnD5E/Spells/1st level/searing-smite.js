/* ==========================================================================
    Macro:         Searing Smite
    Source:        https://www.patreon.com/posts/searing-smite-56746237
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Searing Smite",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Self Modifier --------------------------------------------------------------
if (props.state === "OnUse") {
    const itemData       = props.lastArg.item;
    const itemName       = game.i18n.localize(itemData.name);
    const { spellLevel } = props.lastArg;

    const effectData = {
        changes: [
            {
                key:      "flags.dnd5e.DamageBonusMacro",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `ItemMacro.${itemName}`,
                priority: 20
            },
            {
                key:      "flags.midi-qol.spellLevel",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    spellLevel,
                priority: 20
            },
            {
                key:      "flags.midi-qol.spellID",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    props.lastArg.uuid,
                priority: 20
            }
        ],
        origin: props.lastArg.uuid,
        disabled: false,
        duration: {
            seconds:    60,
            rounds:     10,
            startRound: game.combat ? game.combat.round: 0,
            startTime:  game.time.worldTime
        },
        flags: {
            dae: {
                itemData,
                specialDuration: ["1Hit"]
            }
        },
        icon:  itemData.img,
        label: itemName
    };

    await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: props.actorData.uuid,
        effects:   [effectData]
    });

    castingAnimation(props.tokenData);
}


// Damage Bonus ---------------------------------------------------------------
if (props.state === "DamageBonus") {
    const weaponUsed = await fromUuid(props.lastArg.uuid);
    const weaponData = await weaponUsed.getChatData();

    if (!["mwak"].includes(weaponData.actionType)) {
        return false;
    }

    const target        = canvas.tokens.get(props.lastArg.hitTargets[0].id);
    const spellDC       = props.actorData.system.attributes.spelldc;
    const concentration = props.actorData.effects.find((item) => {
        return item.label === game.i18n.localize("Concentrating");
    });
    const spellLevel = getProperty(props.actorData.flags, "midi-qol.spellLevel");
    const spellUuid  = getProperty(props.actorData.flags, "midi-qol.spellID");
    const spellItem  = await fromUuid(spellUuid);
    const itemName   = game.i18n.localize(spellItem.name);
    const damageType = "fire";

    const effectData = {
        changes: [
            {
                key:      "flags.midi-qol.OverTime",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    `
                    turn=start,
                    label=${itemName},
                    damageRoll=1d6[${damageType}],
                    saveDC=${spellDC},
                    damageType=${damageType},
                    saveAbility=con,
                    saveMagic=true
                `,
                priority: 20
            },
            {
                key:      "flags.dae.deleteUuid",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    concentration.uuid,
                priority: 20
            }
        ],
        origin: spellUuid,
        flags: {
            dae: {
                token:    target.actor.uuid
            }
        },
        disabled: false,
        duration: {
            seconds:    60,
            rounds:     10,
            startRound: game.combat ? game.combat.round: 0,
            startTime:  game.time.worldTime
        },
        icon:  spellItem.img,
        label: itemName
    };

    if (concentration) {
        await MidiQOL.socket().executeAsGM("createEffects", {
            actorUuid: target.actor.uuid,
            effects:   [effectData]
        });

        const concentrationUpdate = await getProperty(props.actorData.flags, "midi-qol.concentration-data.targets");
        await concentrationUpdate.push({
            tokenUuid: target.document.uuid,
            actorUuid: target.actor.uuid
        });
        await props.actorData.setFlag("midi-qol", "concentration-data.targets", concentrationUpdate);
    }

    attackAnimation(target);

    return {
        damageRoll: `${spellLevel}d6[${damageType}]`,
        flavor:     `(${itemName} (${CONFIG.DND5E.damageTypes[damageType]}))`
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

function castingAnimation (target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.divine_smite.caster.orange")
                .attachTo(target)
                .scaleToObject(2)
            .play();
    }
}

function attackAnimation (target) {
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.divine_smite.target.orange")
                .attachTo(target)
                .scaleToObject(2)
            .play();
    }
}
