import babelParser from "@babel/eslint-parser";
import js from "@eslint/js";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default [
    {
        ...js.configs.recommended,

        files: ["**/*.js", "**/*.mjs"],

        plugins: {
            "@stylistic/js": stylisticJs
        },

        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false
            },

            globals: {
                actor: "readonly",
                token: "readonly",

                AAhelpers: "readonly",
                args: "readonly",
                canvas: "readonly",
                ChatMessage: "readonly",
                CONFIG: "readonly",
                CONST: "readonly",
                DAE: "readonly",
                Dialog: "readonly",
                duplicate: "readonly",
                FilePicker: "readonly",
                ForienIdentification: "readonly",
                foundry: "readonly",
                fromUuid: "readonly",
                fromUuidSync: "readonly",
                game: "readonly",
                getProperty: "readonly",
                Hooks: "readonly",
                mergeObject: "readonly",
                MidiQOL: "readonly",
                Portal: "readonly",
                randomID: "readonly",
                Roll: "readonly",
                Sequence: "readonly",
                Sequencer: "readonly",
                Tagger: "readonly",
                tokenAttacher: "readonly",
                TokenMagic: "readonly",
                ui: "readonly"
            }
        },

        rules: {

            // ESLint: Possible Problems --------------------------------------
            "array-callback-return": ["error"],
            "no-await-in-loop": ["off"],     // disabled due to common Foundry code structure
            "no-constructor-return": ["error"],
            "no-duplicate-imports": ["error"],
            "no-promise-executor-return": ["error"],
            "no-self-compare": ["error"],
            "no-template-curly-in-string": ["error"],
            "no-unmodified-loop-condition": ["error"],
            "no-unreachable-loop": ["error"],
            "no-useless-assignment": ["error"],

            // ESLint: Suggestions --------------------------------------------
            "accessor-pairs": ["warn"],
            "arrow-body-style": ["off"],    // disabled due to common Foundry code structure
            "block-scoped-var": ["error"],
            "camelcase": ["warn", {
                ignoreDestructuring: true,
                ignoreImports: true,
            }],
            "complexity": ["warn", {
                max: 20
            }],
            "consistent-return": ["off"],
            "consistent-this": ["warn"],
            "curly": ["error", "all"],
            "default-case": ["error"],
            "default-case-last": ["error"],
            "default-param-last": ["warn"],
            "dot-notation": ["warn"],
            "eqeqeq": ["warn", "smart"],
            "func-name-matching": ["warn"],
            "func-names": ["warn", "always"],
            "grouped-accessor-pairs": ["warn", "setBeforeGet"],
            "guard-for-in": ["warn"],
            "logical-assignment-operators": ["warn"],
            "max-classes-per-file": ["warn", {
                max: 2
            }],
            "max-depth": ["warn", {
                max: 5
            }],
            "max-lines": ["warn", {
                max: 400,
                skipBlankLines: true,
                skipComments: true
            }],
            "max-lines-per-function": ["warn", {
                max: 50,
                skipBlankLines: true,
                skipComments: true
            }],
            "max-nested-callbacks": ["warn", {
                max: 5
            }],
            "max-params": ["warn", {
                max: 5
            }],
            "new-cap": ["error", {
                capIsNewExceptions: [
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
            "no-alert": ["error"],
            "no-array-constructor": ["error"],
            "no-bitwise": ["error"],
            "no-caller": ["error"],
            "no-else-return": ["warn"],
            "no-empty-function": ["warn", {
                allow: ["constructors"]
            }],
            "no-eq-null": ["error"],
            "no-eval": ["error"],
            "no-extend-native": ["warn"],
            "no-extra-bind": ["warn"],
            "no-implicit-globals": ["error"],
            "no-implied-eval": ["error"],
            "no-invalid-this": ["error"],
            "no-iterator": ["error"],
            "no-label-var": ["error"],
            "no-lone-blocks": ["warn"],
            "no-lonely-if": ["warn"],
            "no-loop-func": ["warn"],
            "no-multi-str": ["warn"],
            "no-new": ["error"],
            "no-new-func": ["error"],
            "no-new-wrappers": ["error"],
            "no-object-constructor": ["error"],
            "no-octal-escape": ["error"],
            "no-param-reassign": ["warn"],
            "no-proto": ["error"],
            "no-return-assign": ["error"],
            "no-script-url": ["error"],
            "no-sequences": ["warn"],
            "no-shadow": ["warn"],
            "no-throw-literal": ["error"],
            "no-undef-init": ["error"],
            "no-undefined": ["error"],
            "no-unused-expressions": ["warn"],
            "no-useless-call": ["error"],
            "no-useless-computed-key": ["warn"],
            "no-useless-concat": ["warn"],
            "no-useless-constructor": ["warn"],
            "no-useless-rename": ["warn"],
            "no-useless-return": ["warn"],
            "no-var": ["error"],
            "no-void": ["error"],
            "prefer-arrow-callback": ["warn"],
            "prefer-const": ["warn"],
            "prefer-destructuring": ["warn"],
            "prefer-object-has-own": ["warn"],
            "prefer-object-spread": ["warn"],
            "prefer-promise-reject-errors": ["warn", {
                allowEmptyReject: true
            }],
            "prefer-rest-params": ["warn"],
            "prefer-spread": ["warn"],
            "prefer-template": ["warn"],
            "require-await": ["warn"],
            "sort-imports": ["warn", {
                ignoreCase: true,
                allowSeparatedGroups: true
            }],

            // Stylistic ------------------------------------------------------
            "@stylistic/js/array-bracket-newline": ["warn", "consistent"],
            "@stylistic/js/array-element-newline": ["warn", "consistent"],
            "@stylistic/js/arrow-parens": ["warn", "as-needed", {
                requireForBlockBody: true
            }],
            "@stylistic/js/arrow-spacing": ["warn"],
            "@stylistic/js/block-spacing": ["warn"],
            "@stylistic/js/brace-style": ["warn", "1tbs", {
                allowSingleLine: true
            }],
            "@stylistic/js/comma-spacing": ["warn"],
            "@stylistic/js/comma-style": ["warn"],
            "@stylistic/js/computed-property-spacing": ["warn"],
            "@stylistic/js/dot-location": ["warn", "property"],
            "@stylistic/js/eol-last": ["warn"],
            "@stylistic/js/function-call-argument-newline": ["warn", "consistent"],
            "@stylistic/js/function-call-spacing": ["warn", "never"],
            "@stylistic/js/function-paren-newline": ["warn", "consistent"],
            "@stylistic/js/implicit-arrow-linebreak": ["warn", "beside"],
            "@stylistic/js/indent": ["warn", 4, {
                ignoreComments: true,
            }],
            "@stylistic/js/key-spacing": ["warn"],
            "@stylistic/js/keyword-spacing": ["warn"],
            "@stylistic/js/lines-between-class-members": ["warn", "always", {
                exceptAfterSingleLine: true
            }],
            "@stylistic/js/max-len": ["warn", {
                code: 130,
                ignoreComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true
            }],
            "@stylistic/js/new-parens": ["warn", "always"],
            "@stylistic/js/newline-per-chained-call": ["warn", {
                ignoreChainWithDepth: 3
            }],
            "@stylistic/js/no-confusing-arrow": ["warn"],
            "@stylistic/js/no-extra-parens": ["warn", "all", {
                nestedBinaryExpressions: false
            }],
            "@stylistic/js/no-extra-semi": ["warn"],
            "@stylistic/js/no-floating-decimal": ["warn"],
            "@stylistic/js/no-mixed-spaces-and-tabs": ["warn"],
            "@stylistic/js/no-multi-spaces": ["warn", {
                ignoreEOLComments: true
            }],
            "@stylistic/js/no-multiple-empty-lines": ["warn", {
                max: 2,
                maxEOF: 1,
                maxBOF: 0
            }],
            "@stylistic/js/no-tabs": ["warn"],
            "@stylistic/js/no-trailing-spaces": ["warn"],
            "@stylistic/js/no-whitespace-before-property": ["warn"],
            "@stylistic/js/nonblock-statement-body-position": ["warn", "beside"],
            "@stylistic/js/object-curly-newline": ["warn", {
                multiline: true,
                consistent: true
            }],
            "@stylistic/js/object-curly-spacing": ["warn", "always"],
            "@stylistic/js/object-property-newline": ["warn", {
                allowAllPropertiesOnSameLine: true
            }],
            "@stylistic/js/operator-linebreak": ["warn", "after"],
            "@stylistic/js/quote-props": ["warn", "consistent-as-needed"],
            "@stylistic/js/quotes": ["warn", "double"],
            "@stylistic/js/rest-spread-spacing": ["warn"],
            "@stylistic/js/semi": ["error"],
            "@stylistic/js/semi-spacing": ["warn"],
            "@stylistic/js/semi-style": ["warn"],
            "@stylistic/js/space-before-blocks": ["warn"],
            "@stylistic/js/space-before-function-paren": ["warn", "always"],
            "@stylistic/js/space-in-parens": ["warn"],
            "@stylistic/js/space-infix-ops": ["warn"],
            "@stylistic/js/spaced-comment": ["warn", "always"],
            "@stylistic/js/switch-colon-spacing": ["warn"],
            "@stylistic/js/template-curly-spacing": ["warn", "never"],
            "@stylistic/js/wrap-regex": ["warn"],
        }
    }
];
