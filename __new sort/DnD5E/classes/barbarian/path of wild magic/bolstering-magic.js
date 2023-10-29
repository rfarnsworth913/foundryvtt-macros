/* ==========================================================================
    Macro:         Bolstering Magic
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Bolstering Magic",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.item,
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Choose Application -----------------------------------------------------
    new Dialog({
        title: `${props.name} Type`,
        content: `
            <form class="form-group flexcol" style="align-items: left; padding: 5px;">
                <fieldset style="border: none">
                    <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
                        <input style="margin-right: 10px; top: 0;" type="radio" id="attackBonus" name="bolsteringMagic" checked />
                        <label for="attackBonus">Attack Bonus</label>
                    </div>
                    <div style="padding-top: 3px; padding-bottom: 3px; display: flex; align-items: center;">
                        <input style="margin-right: 10px; top: 0;" type="radio" id="restoreMagic" name="bolsteringMagic" />
                        <label for="restoreMagic">Restore Magic</label>
                    </div>
                </fieldset>
            </form>
        `,
        buttons: {
            apply: {
                icon: "<i class=\"fas fa-check\"></i>",
                label: "Apply",
                callback: async (html) => {
                    const selection = html.find("input:checked")?.[0].id;

                    if (selection === "attackBonus") {
                        const effectData = [{
                            changes: [
                                {
                                    key:      "system.bonuses.All-Attacks",
                                    mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value:    "+1d3",
                                    priority: 20
                                },
                                {
                                    key:      "system.bonuses.abilities.check",
                                    mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value:    "+1d3",
                                    priority: 20
                                }
                            ],
                            label:    props.name,
                            icon:     props.itemData.img,
                            origin:   props.lastArg.origin,
                            disabled: false,
                            duration: {
                                rounds:     60,
                                seconds:    600,
                                startRound: game.combat ? game.combat.round : 0,
                                startTime:  game.time.worldTime
                            }
                        }];

                        await createEffects({
                            actorData: props.actorData,
                            effects:   effectData
                        });

                    } else {
                        await new Roll("1d3").toMessage();
                    }
                }
            },
            cancel: {
                icon: "<i class=\"fas fa-times\"></i>",
                label: "Cancel"
            }
        }
    }).render(true);
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
