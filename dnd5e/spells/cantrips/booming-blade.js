/* ==========================================================================
    Macro:         Booming Blade
    Source:        https://www.patreon.com/posts/booming-blade-56964900
    Usage:         On Use
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Booming Blade",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.item,
    tokenData,

    targets: lastArg.hitTargets ?? [],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
const gameRound = game.combat ? game.combat.round : 0;


// Apply effect to self -------------------------------------------------------
if (props.state === "OnUse") {
    const effectData = [{
        changes: [
            {
                key:      "flags.midi-qol.BoomingBlade.uuid",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    props.lastArg.uuid,
                priority: 20
            },
            {
                key:      "flags.dnd5e.DamageBonusMacro",
                mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value:    `ItemMacro.${props.itemData.name}`,
                priority: 20
            }
        ],
        origin: props.lastArg.uuid,
        disabled: false,
        duration: {
            rounds:     1,
            seconds:    12,
            startRound: gameRound,
            startTime:  game.time.worldTime
        },
        flags: {
            dae: {
                itemData: props.itemData,
                specialDuration: ["1Attack", "zeroHP", "turnStartSource"]
            }
        },
        icon: props.itemData.img,
        label: game.i18n.localize(props.itemData.name)
    }];

    await createEffects({
        actorData: props.actorData,
        effects:   effectData
    });
}

// Handle Damage Bonus --------------------------------------------------------
if (props.state === "DamageBonus") {

    // Validate Status --------------------------------------------------------
    if (props.targets.length === 0) {
        return false;
    }

    if (!["mwak", "msak"].includes(props.itemData.system.actionType)) {
        return false;
    }

    // Create primary effect --------------------------------------------------
    const target = canvas.tokens.get(props.targets[0].id);
    const spellData = await fromUuid(getProperty(props.actorData.flags, "midi-qol.BoomingBlade.uuid"));
    const spellLevel = props.actorData.system.details.level ?? props.actorData.system.details.cr;
    const damageNumber = 1 + (Math.floor((spellLevel + 1) / 6));

    const effectData = [{
        changes: [{
            key:      "macro.itemMacro",
            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value:    `ItemMacro.${spellData.name}`,
            priority: 20
        }],
        origin: props.lastArg.uuid,
        flags: {
            dae: {
                itemData: spellData,
                specialDuration: ["isMoved", "turnStartSource"]
            }
        },
        disabled: false,
        duration: {
            rounds:     1,
            seconds:    12,
            startRound: gameRound,
            startTime:  game.time.worldTime
        },
        icon: "worlds/assets/icons/spells/cantrips/booming-blade.png",
        label: game.i18n.localize(`${spellData.name} Move`)
    }];

    const effect = await getEffect({
        actorData: target.actor,
        effectLabel: spellData.name
    });

    if (effect) {
        return false;
    }

    // Apply primary effect ---------------------------------------------------
    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.token_border.circle.static.blue.011")
                .atLocation(target)
                .scaleToObject(1.2)
                .persist()
                .name(`BBlade-${target.id}`)
                .thenDo(async () => {
                    await createEffects({
                        actorData: target.actor,
                        effects:   effectData
                    });
                })
            .play();
    } else {
        await createEffects({
            actorData: target.actor,
            effects:   effectData
        });
    }

    // Create secondary effect ------------------------------------------------
    if (spellLevel >= 5) {
        const damageType = "thunder";
        const damageRoll = await new Roll(`${damageNumber - 1}d8[${damageType}]`).roll({ async: true });

        await new MidiQOL.DamageOnlyWorkflow(
            props.actorData,
            props.tokenData,
            damageRoll.total,
            damageType,
            [target],
            damageRoll,
            {
                flavor:     `(${CONFIG.DND5E.damageTypes[damageType]})`,
                itemData:   spellData,
                itemCardId: "new"
            }
        );

        if ((game.modules.get("sequencer")?.active)) {
            new Sequence()
                .effect()
                    .file("jb2a.static_electricity.01.blue")
                    .atLocation(target)
                    .scaleToObject(1.5)
                .play();
        }

        await wait (800);

        const targetEffect = target.actor.effects.find((effect) => {
            return effect.label === game.i18n.localize(`${spellData.name} Move`);
        });
        const secondEffect = [{
            changes: [
                {
                    key:      "flags.midi-qol.BoomingBlade.tokenId",
                    mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value:    target.id,
                    priority: 20
                },
                {
                    key:      "flags.midi-qol.BoomingBlade.uuid",
                    mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value:    getProperty(props.actorData.flags, "midi-qol.BoomingBlade.uuid"),
                    priority: 20
                },
                {
                    key:      "flags.midi-qol.BoomingBlade.damage",
                    mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value:    damageNumber,
                    priority: 20
                },
                {
                    key:      "macro.itemMacro",
                    mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value:    `ItemMacro.${spellData.name}`,
                    priority: 20
                },
                {
                    key:      "flags.dae.deleteUuid",
                    mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value:    targetEffect.uuid,
                    priority: 20
                }
            ],
            origin: lastArg.uuid,
            flags: {
                dae: {
                    itemData: spellData
                }
            },
            disabled: false,
            duration: {
                rounds:     1,
                seconds:    12,
                startRound: gameRound,
                startTime:  game.time.worldTime
            },
            icon: spellData.img,
            label: game.i18n.localize(spellData.name)
        }];

        if (targetEffect) {
            await createEffects({
                actorData: target.actor,
                effects:   secondEffect
            });
        }

        removeEffect({
            actorData:    props.actorData,
            effectLabel: spellData.name
        });
    }

}

// Handle Movement ------------------------------------------------------------
if (props.lastArg["expiry-reason"] === "midi-qol:isMoved") {
    const itemData = await fromUuid(getProperty(props.actorData.flags, "midi-qol.BoomingBlade.uuid"));
    const damageDice = parseInt(getProperty(props.actorData.flags, "midi-qol.BoomingBlade.damage"));
    const tokenData  = canvas.tokens.get(getProperty(props.actorData.flags, "midi-qol.BoomingBlade.tokenId"));
    const damageType = "thunder";
    const damageRoll = await new Roll(`${damageDice}d8[${damageType}]`).roll({ async: true });

    console.warn("Handle Movement");
    console.warn(tokenData);

    await new MidiQOL.DamageOnlyWorkflow(
        tokenData.actor,
        tokenData,
        damageRoll.total,
        damageType,
        [props.tokenData],
        damageRoll,
        {
            flavor: `(${CONFIG.DND5E.damageTypes[damageType]})`,
            itemData: itemData,
            itemCardId: "new"
        }
    );

    removeEffect({
        actorData: props.actorData,
        effectLabel: `${itemData.name}`
    });

    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file("jb2a.impact.012.blue")
                .async()
                .atLocation(props.tokenData)
                .scaleToObject(1.8)
            .play();
    }
}

// Handle Effect Removal ------------------------------------------------------
if (props.state === "off") {
    if ((game.modules.get("sequencer")?.active)) {
        Sequencer.EffectManager.endEffects({
            name: `BBlade-${lastArg.tokenId}`
        });
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
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
}

/**
 * Creates an effect on a selected actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  effects  Effects to be applied to target
 * @returns  {Promise<Function>}       Deletion status of effect
 */
async function createEffects ({ actorData, effects = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effects || effects.length === 0) {
        return console.error("No effects specified");
    }

    return await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actorData.uuid,
        effects
    });
}

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}

/**
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
