/* ==========================================================================
    Macro:              Witch Bolt
    Description:        Handles additional damage for Witch Bolt
    Source:             https://www.patreon.com/posts/witch-bolt-49527392
    Usage:              ???
   ========================================================================== */

// Macro actions --------------------------------------------------------------
const props = getProps();
logProps(props, props.name || this.name);

if (!validateProps(props)) {
    return;
}

// Check Concentration ----------------------------------------------------
if (props.item.data.components.concentration) {
    props.item.data.components.concentration = false;
}

if (props.lastArg.hitTargets.length > 0) {
    const target     = canvas.tokens.get(props.lastArg.hitTargets[0].id);
    const damageType = props.lastArg.damageDetail[0].type;

    if (target.inCombat) {
        let hookId = Hooks.on("updateCombat", combatRound);
        DAE.setFlag(props.actor, "witchBolt", hookId);
    }

    function witchBoltStatus () {
        if (props.actor.effects.find(i => i.data.label === "Concentrating")) {
            new Dialog({
                title: props.item.name,
                content: `<p>Continue concentrating?</p>`,
                buttons: {
                    confirmed: {
                        label: "Continue",
                        callback: () => witchBoltDamage()
                    },
                    cancel: {
                        label: "Cancel It!",
                        callback: witchBoltCancel()
                    }
                }
            }).render(true);
        } else {
            witchBoltCancel();
        }
    }

    async function combatRound (combat, update) {
        if (!("round" in update || "turn" in update)) {
            return;
        }

        if (game.combat.combatant.token.id === props.token.id) {
            if (checkDistance()) {
                return witchBoltStatus();
            } else {
                return witchBoltCancel();
            }
        }
    }

    function checkDistance () {
        let targetList = MidiQOL.findNearby(null, props.token, 30, null);
        return targetList.reduce((list, item) => {
            let wallCheck = canvas.walls.checkCollision(new Ray(props.token, item));
            if (item.id === target.id && !wallCheck) list = true;
            return list;
        }), false;
    }

    function witchBoltDamage () {
        console.info(props.item.name," => Damage Effect");
        let damageRoll = new Roll(`${props.spellLevel}d12[${damageType}]`).evaluate({ async: false });
        game.dice3d?.showForRoll(damageRoll);
        new MidiQOL.DamageOnlyWorkflow(
            props.actor,
            props.token,
            damageRoll.total,
            damageType,
            [target],
            damageRoll,
            {
                flavor:     `(${damageType})`,
                item:       props.item,
                itemCardId: "new"
            }
        )
    }

    async function witchBoltCancel () {
        console.log(props.item.name, " => Removing Spell Effect");
        let concentration = props.actor.effects.find(i => i.data.label === "Concentrating");
        if (concentration) {
            await MidiQOL.socket().executeAsGM("removeEffects", {
                actorUuid: props.actor.uuid,
                effects:   [concentration.id]
            });
        }

        let hookId = DAE.getFlag(props.actor, "witchBolt", combatRound);
        await Hooks.off("updateCombat", hookId);
        await DAE.unsetFlag(props.actor, "witchBolt");
    }
} else {
    console.info(props.item.name, " => Removing Concentration");
    let concentration = props.actor.effects.find(i => i.data.label === "Concentrating");
    if (concentration) {
        await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: props.actor.uuid,
            effects:   [concentration.id]
        });
    }
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg = args[args.length - 1];
    console.warn(lastArg);

    return {
        name:       "Witch Bolt",
        actor:      game.actors.get(lastArg.actor._id),
        item:       lastArg.item,
        token:      canvas.tokens.get(lastArg.tokenId),
        spellLevel: lastArg.spellLevel,

        lastArg
    };
}

/**
* Logs the extracted property values to the console for debugging purposes
*/
function logProps (props, title) {
    console.group(`${title} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
* Takes the properties object and validates that all specified values have been defined before trying to execute
* the macro
*
* @param  props  Properties to be evaluated
*/
function validateProps (props) {
    let missingProps = [];

    Object.keys(props).forEach((key) => {
        if (props[key] === undefined || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
