/* ==========================================================================
    Macro:              Sacred Weapon
    Description:        Modifies a specified weapon as per the spell
    Source:             Custom
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Handle adding weapon ---------------------------------------------------
    if (props.state === "on") {

        // Get weapons information --------------------------------------------
        const weapons = props.target.items.filter((item) => {
            return item.data.type === "weapon";
        });
        let weaponsList = "";

        for (let weapon of weapons) {
            weaponsList += `<option value="${weapon.id}">${weapon.name}</option>`;
        }

        if (weaponsList.length === 0) {
            return ui.notifications.error("No weapons of the apporiate type were found!");
        }


        // Weapon Dialog ------------------------------------------------------
        new Dialog({
            title: "Choose your equiped weapons",
            content: `
                <div class="form-group">
                    <label>Weapons: </label>
                    <select id="weapons" style="margin-top: 7px;">
                        ${weaponsList}
                    </select>
                    <hr />
                </div>
            `,
            buttons: {
                ok: {
                    icon:  `<i class="fas fa-check"></i>`,
                    label: "Ok",
                    callback: async (html) => {
                        let itemID     = html.find("#weapons").val();
                        let weapon     = props.target.items.get(itemID);
                        let weaponCopy = duplicate(weapon);

                        DAE.setFlag(props.target, `sacredWeapon`, {
                            id: itemID,
                            magic: weaponCopy.data.properties.mgc
                        });

                        weaponCopy.data.ability        = "cha";
                        weaponCopy.data.properties.mgc = true;
                        props.target.updateEmbeddedDocuments("Item", [weaponCopy]);
                        ChatMessage.create({ content: weaponCopy.name + " is empowered" });

                        if (game.modules.get("sequencer")?.active) {
                            new Sequence()
                                .effect()
                                    .file("jb2a.magic_signs.circle.02.transmutation.intro.green")
                                    .atLocation(props.token)
                                    .scaleToObject(1.5)
                                    .belowTokens()
                                    .waitUntilFinished(-550)
                                .effect()
                                    .file("jb2a.magic_signs.circle.02.transmutation.loop.green")
                                    .atLocation(props.token)
                                    .scaleToObject(1.5)
                                    .belowTokens()
                                    .fadeIn(200)
                                    .fadeOut(200)
                                    .waitUntilFinished(-550)
                                .effect()
                                    .file("jb2a.magic_signs.circle.02.transmutation.outro.green")
                                    .atLocation(props.token)
                                    .scaleToObject(1.5)
                                    .belowTokens()
                                .play();
                        }
                    }
                },
                cancel: {
                    icon:  `<i class="fas fa-times"></i>`,
                    label: "Cancel"
                }
            }
        }).render(true);
    }


    // Handle removing weapon -------------------------------------------------
    if (props.state === "off") {
        let flag = DAE.getFlag(props.target, `sacredWeapon`);

        if (!flag) {
            return {};
        }

        let weapon     = props.target.items.get(flag.id);
        let weaponCopy = duplicate(weapon);

        weaponCopy.data.ability        = "";
        weaponCopy.data.properties.mgc = flag.magic;
        props.target.updateEmbeddedDocuments("Item", [weaponCopy]);
        DAE.unsetFlag(props.target, `sacredWeapon`);
        ChatMessage.create({ content: weaponCopy.name + " returns to normal" });
    }

})();


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
        name:   "Sacred Weapon",
        state:  args[0] || "",
        token:  canvas.tokens.get(lastArg.tokenId),
        target: lastArg.tokenId ? canvas.tokens.get(lastArg.tokenId).actor :
                                  game.actors.get(lastArg.actorId)
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
