async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const originItem = lastArg.efData.flags.dae.itemData;
const originEffectId = lastArg.effectId;
console.log(lastArg);

async function combatRound(combat, update) {
  if (!("round" in update || "turn" in update)) return;
  return new Promise(async (resolve) => {
    let item = tokenD.actor.data.items.find(i => i.name === "Soothing Twilight");
    if(!item) {
      let effect = tokenD.actor.effects.find(i=> i.data.label === originItem.name);
      await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [effect.id] });
      return ui.notifications.warn(`Shutting Down ${originItem.name}, Soothing Twilight is missing.`);
    };
    let distance = item.data.data.range.value;
    let target = canvas.tokens.get(game.combat.previous.tokenId);
    let targetDis = target.data.disposition + 1;
    let targetDistance = MidiQOL.getDistance(tokenD, target, true, true);
    let friendly = targetDistance <= distance && tokenD.data.disposition === target.data.disposition;
    let matchDis = Object.keys(CONST.TOKEN_DISPOSITIONS)[targetDis];
    if (!friendly) return console.log(`${item.name} skipping target ${target.name} => [${matchDis}]`);
    await target.setTarget(true, { releaseOthers: true });
    await item.roll();
  });
}

if (args[0] === "on") {
  let hookId = Hooks.on("updateCombat", combatRound);
  DAE.setFlag(tokenD.actor, "twilightEffect", hookId);
  let itemData = [{
    "name": "Soothing Twilight",
    "type": "feat",
    "img": "worlds/assets/icons/features/class/cleric/twilight-sanctuary.png",
    "data": {
      "description": {
        "value": "<p>Whenever a creature (including you) ends its turn in the sphere, you can grant that creature one of these benefits:</p>\n<ul>\n<li>You grant it temporary hit points equal to 1d6 plus your cleric level.</li>\n</ul>\n<ul>\n<li>You end one effect on it causing it to be charmed or frightened.</li>\n</ul>",
        "chat": "",
        "unidentified": ""
      },
      "activation": {
        "type": "special",
        "cost": null,
        "condition": ""
      },
      "range": {
        "value": 30,
        "long": null,
        "units": "ft"
      }
    },
    "flags": {
      "midi-qol": {
        "onUseMacroName": "ItemMacro"
      },
      "itemacro": {
        "autoanimations": {
          "version": 2,
          "killAnim": false,
          "animLevel": false,
          "options": {
            "ammo": false,
            "staticType": "target",
            "opacity": 1,
            "persistent": false,
            "staticOptions": "staticSpells",
            "variant": "02",
            "repeat": 1,
            "delay": 250,
            "scale": 1,
            "enableCustom": false
          },
          "override": true,
          "sourceToken": {
            "enable": false
          },
          "targetToken": {
            "enable": false
          },
          "animType": "static",
          "animation": "generichealing",
          "color": "purplepink",
          "audio": {
            "a01": {
              "enable": false
            }
          },
          "explosions": {
            "enable": false
          }
        },
        "macro": {
          "data": {
            "_id": null,
            "name": "Soothing Twilight",
            "type": "script",
            "author": "Tyd5yiqWrRZMvG30",
            "img": "icons/svg/dice-target.svg",
            "scope": "global",
            "command": "async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }\nconst actorD = game.actors.get(args[0].actor._id);\nconst tokenD = canvas.tokens.get(args[0].tokenId);\nconst itemD = args[0].item;\nconst target = canvas.tokens.get(args[0].targets[0].id);\nconst cancel = false;\nlet aButtons = { cancel: { label: \"Cancel\", callback: async () => cancel } };\nlet heal = \"heal\";\nlet cure = \"cure\";\nlet targetTempHp = target.actor.data.data.attributes.hp.temp;\nlet maxPosTemp = await new Roll('1d6 + @classes.cleric.levels', actorD.getRollData()).evaluate({ maximize: true, async: true }).total;\nlet damageRoll = await new Roll('1d6 + @classes.cleric.levels', actorD.getRollData()).evaluate({ async: true });\nconsole.log(`[${itemD.name}] Maximum Temp Heal: ${damageRoll.formula} = ${maxPosTemp}`);\nconsole.log(`Target: ${target.name}, Current TempHP: ${targetTempHp != null ? targetTempHp : 0}, Rolled TempHp: ${damageRoll.total} => ${damageRoll.total > targetTempHp ? \"Continue\" : \"Terminated\"}`);\nlet target_conditions = [\"Charmed\", \"Frightened\"];\nlet targetInflicted = target.actor.effects.filter(i => target_conditions.includes(i.data.label)).reduce((list, item) => {\n    console.log(`Condition Found: ${item.data.label}`);\n    list.push(`<img class=\"condition\" src=\"${item.data.icon}\" width=\"30\" height=\"30\" title=\"${item.data.label}\"}>`);\n    return list;\n}, []);\n\nif ((targetTempHp === maxPosTemp) && (targetInflicted.length === 0)) return await game.user.updateTokenTargets([]);\n\nif ((targetTempHp != maxPosTemp) && (damageRoll.total > targetTempHp)) {\n    aButtons[heal] = {\n        label: \"Heal\", callback: async (html) => {\n            let damageType = \"temphp\";\n            game.dice3d?.showForRoll(damageRoll);\n            await new MidiQOL.DamageOnlyWorkflow(actorD, tokenD, damageRoll.total, damageType, [target], damageRoll, { flavor: `(${CONFIG.DND5E.healingTypes[damageType]})`, itemCardId: args[0].itemCardId, useOther: false });\n            await ui.chat.scrollBottom();            \n            await game.user.updateTokenTargets([]);\n        }\n    }\n}\n\nif (targetInflicted.length > 0) {\n    aButtons[cure] = {\n        label: \"Cure\", callback: async () => {\n            let condition_list = [\"Charmed\", \"Frightened\"];\n            let effect = target.actor.effects.filter(i => condition_list.includes(i.data.label));\n            let selectOptions = \"\";\n            for (let i = 0; i < effect.length; i++) {\n                let condition = effect[i].data.label;\n                selectOptions += `<option value=\"${condition}\">${condition}</option>`;\n            }\n            if (selectOptions === \"\") {\n                return ui.notifications.warn(`There's nothing to Cure on ${target.name}.`);\n            } else {\n                let content_cure = `<p>Choose a Condition Cure</p><form class=\"flexcol\"><div class=\"form-group\"><select id=\"element\">${selectOptions}</select></div></form>`;\n                new Dialog({\n                    title: itemD.name,\n                    content: content_cure,\n                    buttons: {\n                        cure: {\n                            icon: '<i class=\"fas fa-check\"></i>',\n                            label: 'Cure!',\n                            callback: async (html) => {\n                                let element = html.find('#element').val();\n                                let effect = target.actor.effects.find(i => i.data.label === element);\n                                if (effect) await MidiQOL.socket().executeAsGM(\"removeEffects\", { actorUuid: target.actor.uuid, effects: [effect.id] });\n                                let chatContent = `<div class=\"midi-qol-nobox\"><div class=\"midi-qol-flex-container\"><div>Cures ${element}:</div><div class=\"midi-qol-target-npc midi-qol-target-name\" id=\"${target.id}\"> ${target.name}</div><div><img src=\"${target.data.img}\" width=\"30\" height=\"30\" style=\"border:0px\"></img></div></div></div>`;\n                                await wait(500);\n                                const chatMessage = game.messages.get(args[0].itemCardId);\n                                let content = duplicate(chatMessage.data.content);\n                                const searchString = /<div class=\"midi-qol-hits-display\">[\\s\\S]*<div class=\"end-midi-qol-hits-display\">/g;\n                                const replaceString = `<div class=\"midi-qol-hits-display\"><div class=\"end-midi-qol-hits-display\">${chatContent}`;\n                                content = content.replace(searchString, replaceString);\n                                chatMessage.update({ content: content });\n                                await ui.chat.scrollBottom();                                \n                                await game.user.updateTokenTargets([]);\n                            }\n                        }\n                    },\n                    default: \"cure\",\n                }).render(true);\n            }\n        }\n    }\n}\nlet finalButtons = Object.values(aButtons);\nif (finalButtons.length === 1) return await game.user.updateTokenTargets([]);\nnew Dialog({\n    title: `${itemD.name} : Choose an Effect`,\n    content: `<style>#twilightInfo img{border:none}#twilightInfo{padding:10px}#twilightInfo .target{margin-right:10px}#twilightInfo .condition{border:1px solid red!important;margin:2px 5px}#twilightInfo ul{list-style:none}#twilightInfo ul li{float:left;margin-right:5px}</style><div id=\"twilightInfo\" class=\"form-group\"><ul><li><img class=\"target\" src=\"${target.data.img}\" height=\"40\" width=\"40\" title=\"${target.name}\"></li><li><div><b>Target:</b> ${target.name}</div><div><b>Temp HP:</b> ${targetTempHp != null ? targetTempHp : 0} / ${maxPosTemp}</div></li><li><div>${targetInflicted.join('')}</div></li></ul></div>`,\n    buttons: aButtons,\n    default: cancel\n}).render(true);",
            "folder": null,
            "sort": 0,
            "permission": {
              "default": 0
            },
            "flags": {}
          }
        },
        "autoanimations": {
          "version": 2,
          "killAnim": false,
          "animLevel": false,
          "options": {
            "ammo": false,
            "staticType": "target",
            "opacity": 1,
            "persistent": false,
            "staticOptions": "staticSpells",
            "variant": "02",
            "repeat": 1,
            "delay": 250,
            "scale": 1,
            "enableCustom": false
          },
          "override": true,
          "sourceToken": {
            "enable": false
          },
          "targetToken": {
            "enable": false
          },
          "animType": "static",
          "animation": "generichealing",
          "color": "purplepink",
          "audio": {
            "a01": {
              "enable": false
            }
          },
          "explosions": {
            "enable": false
          }
        }
      }
    }
  }];
  let item = tokenD.actor.items.find(i => i.name === "Soothing Twilight");
  if (item) {
    await tokenD.actor.deleteEmbeddedDocuments("Item", [item.id]);
    await tokenD.actor.createEmbeddedDocuments("Item", itemData);
  } else {
    await tokenD.actor.createEmbeddedDocuments("Item", itemData);
  }
}

if (args[0] === "off") {
  let item = tokenD.actor.items.find(i => i.name === "Soothing Twilight");
  let hookId = DAE.getFlag(tokenD.actor, "twilightEffect");
  Hooks.off("updateCombat", hookId);
  await DAE.unsetFlag(tokenD.actor, "twilightEffect");
  if (item) await tokenD.actor.deleteEmbeddedDocuments("Item", [item.id]);
}
