/* ==========================================================================
    Macro:              Variable Illumination
    Description:        Handles applying light to the specified token
    Source:             Custom
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Validate required macros -----------------------------------------------
    const TokenUpdate = game.macros.getName("TokenUpdate");
    if (!TokenUpdate) {
        return ui.notifications.error("The macro TokenUpdate is required!");
    }


    // Render selection dialog box --------------------------------------------
    new Dialog({
        title: "Variable Illumination Range",
        content: `
            <div class="form-group">
                <label for="lightRange">Light range between 5 and 20</label>
                <input type="number" id="lightRange" list="rangeValues" min="5" max="20" style="margin-top: 15px;" />
                <datalist id="rangeValues">
                <option value="5" label="5"></option>
                <option value="6" label="6"></option>
                <option value="7" label="7"></option>
                <option value="8" label="8"></option>
                <option value="9" label="9"></option>
                <option value="10" label="10"></option>
                <option value="11" label="11"></option>
                <option value="12" label="12"></option>
                <option value="13" label="13"></option>
                <option value="14" label="14"></option>
                <option value="15" label="15"></option>
                <option value="16" label="16"></option>
                <option value="17" label="17"></option>
                <option value="18" label="18"></option>
                <option value="19" label="19"></option>
                <option value="20" label="20"></option>
                </datalist>
            </div>
        `,
        buttons: {
            ok:{
                icon: `<i class="fas fa-check"></i>`,
                label: "Update",
                callback: async (html) => {
                    const range = html.find("#lightRange").val();
                    TokenUpdate.execute(props.tokenID, {
                        light: {
                            active: true,
                            dim:    Number(range * 2),
                            bright: Number(range),
                            color:  props.color,
                            alpha:  0.25,
                            animation: {
                                type:      "pulse",
                                speed:     3,
                                intensity: 4
                            }
                        }
                    });
                }
            }
        }
    }).render(true);

})();

/**
 * Returns the lighting color for the token
 *
 * @param    {string}  image  Source image string
 * @returns  {string}         Hex code for the lighting
 */
function getColor (image) {

    if (image.includes("Bright Blue")) {
        return "#C4F4FF";
    } else if (image.includes("Bright Yellow")) {
        return "#FFFFBE";
    } else if (image.includes("Green")) {
        return "#D2FF2E";
    } else if (image.includes("Turq")) {
        return "#44FCF6";
    } else if (image.includes("White")) {
        return "#F2FFFF";
    } else if (image.includes("Yellow")) {
        return "#FFFF03";
    }

    return "#3CD7FF";
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
    const target  = canvas.tokens.get(lastArg.tokenId);

    console.warn(lastArg);

    return {
        name: "Variable Illumination",
        color: getColor(target.data.img || ""),
        target,
        tokenID: lastArg.tokenId
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
