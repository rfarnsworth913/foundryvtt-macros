// Finalize Macro

/* ==========================================================================
    Macro:         Mirror Image
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Mirror Image",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    icon: lastArg.efData.icon || "",

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    // eslint-disable-next-line max-lines-per-function
    const hookID = Hooks.on("midi-qol.preDamageRollComplete", async (workflow) => {

        // Validate hook information ------------------------------------------
        const { actionType } = workflow.item.system;
        if (actionType !== "mwak" && actionType !== "rwak" && actionType !== "msak" && actionType !== "rsak") {
            return true;
        }

        let targetIndex = -1;
        for (let i = 0; i < workflow.hitTargets.size; i++) {
            if (Array.from(workflow.hitTargets)[i].id === props.tokenData.id) {
                targetIndex = i;
            }
        }

        if (targetIndex === -1) {
            return true;
        }

        // Check Mirror Image Hit ---------------------------------------------
        let interruptDamage = false;

        let clones = DAE.getFlag(props.actorData, "mirrorImageClones") || 3;
        const attackDC = clones === 3 ? 6 : clones === 2 ? 8 : 11;
        const saveRoll = new Roll("1d20").roll({ async: false });
        await game.dice3d?.showForRoll(saveRoll);

        if (saveRoll.total >= attackDC) {
            clones -= 1;
            DAE.setFlag(props.actorData, "mirrorImageClones", clones);
            interruptDamage = true;

            const content = `
                <div class="dnd5e chat-card item-card midi-qol-item-card">
                    <header class="card-header flexrow">
                        <img src="${props.icon}" title="Mirror Image" width="36" height="36" />
                        <h3 class="item-name">Mirror Image</h3>
                    </header>
                </div>
                <div class="dice-roll">
                    <div class="dice-result">One of you duplicates took the hit for you!
                        <h4 class="dice-total">${saveRoll.total}</h4>
                        <h4 class="item-name" text-align=center>Duplicates Remaining</h4>
                        <h4 class="dice-total">${clones}</h4>
                    </div>
                </div>
            `;

            ChatMessage.create({
                roll: saveRoll,
                speaker: {
                    alias: props.actorData.name
                },
                content
            });
        }

        // Handle Interrupting Damage -----------------------------------------
        if (interruptDamage) {
            workflow.hitTargets.forEach((index) => {
                if (index.id === props.tokenData.id) {
                    workflow.hitTargets.delete(index);
                }
            });
        }
    });

    DAE.setFlag(props.actorData, "mirrorImageClones", 3);
    DAE.setFlag(props.actorData, "mirrorImageHookID", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "mirrorImageHookID");
    DAE.unsetFlag(props.actorData, "mirrorImageHookID");
    DAE.unsetFlag(props.actorData, "mirrorImageClones");

    Hooks.off("midi-qol.preDamageRollComplete", hookID);
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
