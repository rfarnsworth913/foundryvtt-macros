/* ==========================================================================
    Macro:         Magic Missile
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];

const props = {
    name: "Magic Missile",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: lastArg.actor || {},
    tokenData: await fromUuidSync(lastArg.tokenUuid) || {},

    boltNumber: lastArg.castData.castLevel + 2,
    damageType: CONFIG.DND5E.damageTypes.force.label.toLowerCase(),
    itemData: lastArg.item,
    spellLevel: lastArg.castData.castLevel,
    targets: lastArg.hitTargets,

    animation: "jb2a.magic_missile.blue",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------

// Handle targeting -----------------------------------------------------------
if (props.targets.length === 0) {
    return ui.notifications.error("No targets selected for Magic Missile!");
}

let targetData;
let errorMessage = "";

if (props.targets.length === 1) {
    targetData = [{
        target: props.targets[0].id,
        bolts: props.boltNumber
    }];
} else {
    targetData = await targetingDialog(props.targets);
}

// Check for errors -----------------------------------------------------------
if (errorMessage) {
    return ui.notifications.error(errorMessage);
}

// Handle damage rolls --------------------------------------------------------
targetData.forEach(async (currentTarget) => {
    const target = await canvas.tokens.get(currentTarget.target);
    const damageFormula = `${currentTarget.bolts}d4 + ${currentTarget.bolts}`;

    await animation(props.tokenData, target, currentTarget.bolts);
    const damage = await new CONFIG.Dice.DamageRoll(damageFormula, {}, { type: "force" }).evaluate();
    await new MidiQOL.DamageOnlyWorkflow(
        props.actorData,
        props.tokenData,
        damage.total,
        "force",
        [target],
        damage,
        {
            flavor: "Magic Missile",
            itemCardId: lastArg.itemCardId
        }
    );
});


/**
 * Handles creating and returning targeting information from a custom targeting dialog box
 *
 * @param {Token5e} targetsData Magic Missile Targets
 * @returns                 Targeting or error information
 */
// eslint-disable-next-line max-lines-per-function
function targetingDialog (targetsData) {

    // Dialog Content -------------------------------------------------------------
    const targetContent = targetsData.reduce((list, target) => {
        const image = target.texture.src;
        const selectOption = `
            <label for="${target.id}" class="radio-label">
                <img src="${image}" style="border: 0; width: 50px; height: 50;" />
                ${target.actor.name}
                <input type="number" id="${target.id}" name="missileCount" value="0" min="0" max="12" />
            </label>`;

        return list + selectOption;
    }, []);

    // Render Dialog Box ----------------------------------------------------------
    return Dialog.wait({
        title: "Magic Missile Damage",
        content: `
        <style>
                #magicMissile .form-group {
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                }

                #magicMissile img {
                    border: 0;
                    width: 50px;
                    height: 50px;
                    flex: 0 0 50px;
                    margin-right: 7px;
                }

                #magicMissile label {
                    display: flex;
                    align-items: center;
                    flex: 0 0 100%;
                    justify-content: start;
                    width: 100%;
                }

                #magicMissile input[type="number"] {
                    display: inline-block;
                    margin-left: auto;
                    width: 50px;
                }

            </style>
            <form id="magicMissile">
                <p>You currently have ${props.boltNumber} total Magic Missile bolts.</p>
                <hr />
                <div class="form-group">
                    ${targetContent}
                </div>
            </form>
    `,
        buttons: {
            damage: {
                label: "Damage",
                callback: async (html) => {
                    const targets = await html.find("input[name='missileCount']");
                    const targetDamageData = [];
                    let spentBolts = 0;

                    for (const selectedTarget of targets) {
                        if (selectedTarget.value > 0) {
                            spentBolts += parseInt(selectedTarget.value);
                            targetDamageData.push({
                                target: selectedTarget.id,
                                bolts: selectedTarget.value
                            });
                        }
                    }

                    if (spentBolts > props.boltNumber) {
                        errorMessage = "You have spent more bolts than you have available!";
                    }

                    if (spentBolts === 0) {
                        errorMessage = "The spell fails, no bolts were spent!";
                    }

                    return targetDamageData;
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {
                    return [];
                }
            }
        }
    });
}

/**
 * Magic Missile Animation
 *
 * @param {Token5e} caster  Caster
 * @param {Token5e} target  Target
 * @param {number} bolts    Number of Bolts
 */
async function animation (caster, target, bolts) {
    if (game.modules.get("sequencer")?.active) {
        const fire = new Sequence()
            .effect()
                .file(props.animation)
                .atLocation(caster)
                .stretchTo(target)
                .repeats(Number(bolts), 500, 500)
                .randomizeMirrorY();

        return await fire.play();
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
