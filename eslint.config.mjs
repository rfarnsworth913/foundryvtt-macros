import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";

export default [
    {
        ...js.configs.recommended,

        files: ["**/*.js", "**/*.mjs"],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false
            },

            globals: {
                "actor":                 "readonly",
                "token":                 "readonly",

                "AAhelpers":            "readonly",
                "args":                 "readonly",
                "canvas":               "readonly",
                "ChatMessage":          "readonly",
                "CONFIG":               "readonly",
                "CONST":                "readonly",
                "DAE":                  "readonly",
                "Dialog":               "readonly",
                "duplicate":            "readonly",
                "FilePicker":           "readonly",
                "ForienIdentification": "readonly",
                "foundry":              "readonly",
                "fromUuid":             "readonly",
                "fromUuidSync":         "readonly",
                "game":                 "readonly",
                "getProperty":          "readonly",
                "Hooks":                "readonly",
                "mergeObject":          "readonly",
                "MidiQOL":              "readonly",
                "Portal":               "readonly",
                "randomID":             "readonly",
                "Roll":                 "readonly",
                "Sequence":             "readonly",
                "Sequencer":            "readonly",
                "Tagger":               "readonly",
                "tokenAttacher":        "readonly",
                "TokenMagic":           "readonly",
                "ui":                   "readonly"
            }
        },

        rules: {

            // ESLint: Possible Problems --------------------------------------
            "array-callback-return":        ["error"],
            "no-await-in-loop":             ["error"],
            "no-constructor-return":        ["error"],
            "no-duplicate-imports":         ["error"],
            "no-promise-executor-return":   ["error"],
            "no-self-compare":              ["error"],
            "no-template-curly-in-string":  ["error"],
            "no-unmodified-loop-condition": ["error"],
            "no-unreachable-loop":          ["error"],
            "no-useless-assignment":        ["error"],

            // ESLint: Suggestions --------------------------------------------
            "accessor-pairs":               ["warn"],
            "arrow-body-style":             ["warn", "as-needed"],
            "block-scoped-var":             ["error"],
            "camelcase":                    ["warn", {
                "ignoreDestructuring": true,
                "ignoreImports":       true,
            }],
            "complexity":                   ["warn", {
                "max": 20
            }],
            "consistent-return":            ["warn"],
            "consistent-this":              ["warn"],
            "curly":                        ["error", "all"],
            "default-case":                 ["error"],
            "default-case-last":            ["error"],
            "default-param-last":           ["warn"],
            "dot-notation":                 ["warn"],
            "eqeqeq":                       ["warn", "smart"],
            "func-name-matching":           ["warn"],
            "func-names":                   ["warn", "always"],
            "gropuped-accessor-pairs":      ["warn", "setBeforeGet"],
            "guard-for-in":                 ["warn"],
            "logical-assignment-operators": ["warn"],
            "max-classes-per-file":         ["warn", {
                "max": 2
            }],
            "max-depth":                    ["warn", {
                "max": 5
            }],
            "max-lines":                    ["warn", {
                "max":            400,
                "skipBlankLines": true,
                "skipComments":   true
            }],
            "max-lines-per-function":       ["warn", {
                "max":            50,
                "skipBlankLines": true,
                "skipComments":   true
            }],
            "max-nested-callbacks":         ["warn", {
                "max": 5
            }],
            "max-params":                   ["warn", {
                "max": 5
            }],
            "new-cap":                      ["error", {
                "capIsNewExceptions": [
                    "Component",
                    "ContentChild",
                    "Directive",
                    "HostListener",
                    "Injectable",
                    "Input",
                    "MockComponent",
                    "NgModule",
                    "Pipe",
                    "Output",
                    "ViewChild"
                ]
            }],
            "no-alert":                     ["error"],
            "no-array-constructor":         ["error"],
            "no-bitwise":                   ["error"],

        }
    }
]
