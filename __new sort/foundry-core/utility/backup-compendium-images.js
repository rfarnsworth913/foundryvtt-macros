/* ==========================================================================
    Macro:         Backup Compendium Images
    Source:        https://gitlab.com/-/snippets/2138719
    Usage:         Standard Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Backup Compendium Images",

    packs: [
        "ancestries",
        "backgrounds",
        "heritages",
        "equipment",
        "feats-srd",
        "spells"
    ],

    folderName: encodeURI(`${game.system.id}CompendiumMappingBackup`)
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check for permissions ------------------------------------------------------
try {
    FilePicker.createDirectory("data", props.folderName, {});
} catch (error) {
    ui.notifications.error("You do not have permission to run this macro");
    return false;
}

ui.notifications.info("Starting export, this may take some time");

async function exportMapping (gamePack, type) {
    const pack  = game.packs.get(gamePack);
    const items = await pack.getDocuments();

    const mappedImages = items.map((item) => {
        return type === "Item" ?
            { id: item.id, img: item.img } :
            "";
    });

    const fileName = encodeURI(`${gamePack}.json`);
    console.log(gamePack, type, fileName);
    const file = new File([JSON.stringify(mappedImages, null, "")], fileName, { type: "application/json" });
    await FilePicker.upload("data", props.folderName, file);
}

const gamePacks = game.packs.filter((entry) => {
    return props.packs.indexOf(entry.metadata.name) > -1;
});

for (const pack of gamePacks) {
    const gamePack = pack.collection;
    const type     = pack.documentName;

    // eslint-disable-next-line no-await-in-loop
    await exportMapping(gamePack, type);
}

ui.notifications.info("Export complete!");


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
