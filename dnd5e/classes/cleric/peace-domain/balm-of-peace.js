/* ==========================================================================
    Macro:         Balm of Peace
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
   const lastArg   = args[args.length - 1];
   const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

   const props = {
       name: "Balm of Peace",
       state: args[0]?.tag || args[0] || "unknown",

       actorData: tokenData?.actor || {},
       tokenData
   };

   logProps(props);


   /* ==========================================================================
       Macro Logic
      ========================================================================== */
   if (props.state === "on") {
       const itemData = {
            "name": "Balm of Peace (Heal)",
            "type": "feat",
            "img": "worlds/assets/icons/features/class/cleric/channel-divinity-balm-of-peace.png",
            "data": {
            "description": {
                "value": "<p><a href=\"https://www.dndbeyond.com/classes/cleric#ChannelDivinity:BalmofPeace-2997261\" target=\"_blank\" rel=\"noopener\">DnD Beyond: Channel Divinity: Balm of Peace</a></p>\n<h3><strong>Summary</strong></h3>\n<p>You can use your Channel Divinity to make your very presence a soothing balm. As an action, you can move up to your speed, without provoking opportunity attacks, and when you move within 5 feet of any other creature during this action, you can restore a number of hit points to that creature equal to 2d6 + your Wisdom modifier (minimum of 1 hit point). A creature can receive this healing only once whenever you take this action.</p>\n<hr />\n<h3><strong>Foundry Configuration</strong></h3>\n<ul>\n<li style=\"padding-top:3px;padding-bottom:3px\">Set resource to your Channel Divinity Pool</li>\n</ul>",
                "chat": "",
                "unidentified": ""
            },
            "source": "Tasha's Cauldron of Everything",
            "activation": {
                "type": "action",
                "cost": 1,
                "condition": ""
            },
            "duration": {
                "value": null,
                "units": "inst"
            },
            "target": {
                "value": 1,
                "width": null,
                "units": "",
                "type": "creature"
            },
            "range": {
                "value": null,
                "long": null,
                "units": "touch"
            },
            "uses": {
                "value": null,
                "max": "",
                "per": ""
            },
            "consume": {
                "type": "",
                "target": "",
                "amount": null
            },
            "ability": "",
            "actionType": "heal",
            "attackBonus": 0,
            "chatFlavor": "",
            "critical": {
                "threshold": null,
                "damage": ""
            },
            "damage": {
                "parts": [
                [
                    "2d6 + @abilities.wis.mod",
                    "healing"
                ]
                ],
                "versatile": ""
            },
            "formula": "",
            "save": {
                "ability": "",
                "dc": null,
                "scaling": "spell"
            },
            "requirements": "Peace Domain 2",
            "recharge": {
                "value": null,
                "charged": false
            }
            },
            "effects": [],
            "flags": {
            "scene-packer": {
                "hash": "28bd99294700a6f7178490ac45f1b6acea3200a5",
                "sourceId": "Item.AL06Yg6sWT3YTAAZ"
            },
            "magicitems": {
                "enabled": false,
                "equipped": false,
                "attuned": false,
                "charges": "0",
                "chargeType": "c1",
                "destroy": false,
                "destroyFlavorText": "reaches 0 charges: it crumbles into ashes and is destroyed.",
                "rechargeable": false,
                "recharge": "0",
                "rechargeType": "t1",
                "rechargeUnit": "r1",
                "sorting": "l"
            },
            "midi-qol": {
                "effectActivation": false
            },
            "midiProperties": {
                "nodam": false,
                "fulldam": false,
                "halfdam": false,
                "rollOther": false,
                "critOther": false,
                "magicdam": false,
                "magiceffect": false,
                "concentration": false,
                "toggleEffect": false,
                "selfEffect": false
            },
            "autoanimations": {
                "version": 4,
                "killAnim": false,
                "animLevel": false,
                "options": {
                "ammo": false,
                "staticType": "target",
                "menuType": "spell",
                "variant": "01",
                "enableCustom": false,
                "repeat": null,
                "delay": null,
                "scale": null,
                "opacity": null,
                "unbindAlpha": false,
                "unbindVisibility": false,
                "persistent": false
                },
                "override": true,
                "sourceToken": {
                "enable": false
                },
                "targetToken": {
                "enable": false
                },
                "levels3d": {
                "type": ""
                },
                "macro": {
                "enable": false
                },
                "animType": "static",
                "animation": "curewounds",
                "color": "blue",
                "audio": {
                "a01": {
                    "enable": false
                }
                },
                "preview": false,
                "explosions": {
                "enable": false
                }
            },
            "core": {
                "sourceId": "Item.sZOlQVh4b1Ow4eFH"
            },
            "cf": {
                "id": "temp_n6dlcb1l66b"
            },
            "exportSource": {
                "world": "hard-knocks",
                "system": "dnd5e",
                "coreVersion": "9.269",
                "systemVersion": "1.6.3"
            }
            }
        };

       await props.actorData.createEmbeddedDocuments("Item", [itemData]);
   }

   if (props.state === "off") {
       await removeItem({
           actorData: props.actorData,
           itemLabel: "Balm of Peace (Heal)"
       });
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
       console.group(`${props.name} Macro`);
       Object.keys(props).forEach((key) => {
           console.log(`${key}: `, props[key]);
       });
       console.groupEnd();
   }

   /**
    * Finds and removes an item from the specified actor's inventory
    *
    * @param    {Actor5e}  actorData  Actor to be operated on
    * @param    {String}   itemLabel  Item name to be removed from inventory
    * @returns  {Promise}             Removal handler
    */
   async function removeItem ({ actorData, itemLabel = "" } = {}) {
       const getItem = actorData.items.find((item) => {
           return item.name === itemLabel;
       });

       if(!getItem) {
           return {};
       }

       return await getItem.delete();
   }
