/* ==========================================================================
    Module:             Personal Linting Rules
    Version:            8.15.0
    Documentation:      https://eslint.org
   ========================================================================== */

module.exports = {

    // Base Rules -------------------------------------------------------------
    extends: [
        "eslint:recommended"
    ],

    env: {
        browser: true,
        es2021:  true
    },

    globals: {
        "args":      "readonly",
        "canvas":    "readonly",
        "Dialog":    "readonly",
        "duplicate": "readonly",
        "game":      "readonly",
        "Sequence":  "readonly",
        "ui":        "readonly"
    },


    // Rules ------------------------------------------------------------------
    rules: {

        // Possible Problems --------------------------------------------------
        "array-callback-return":           ["error"],
        "no-await-in-loop":                ["error"],
        "no-constructor-return":           ["error"],
        "no-duplicate-imports":            ["warn"],
        "no-promise-executor-return":      ["error"],
        "no-self-compare":                 ["error"],
        "no-unmodified-loop-condition":    ["warn"],
        "no-unused-private-class-members": ["warn"],
        "no-use-before-define":            ["warn", {
            "functions": false
        }],


        // Suggestions --------------------------------------------------------
        "accessor-pairs":                  ["warn"],
        "arrow-body-style":                ["warn", "always"],
        "block-scoped-var":                ["warn"],
        "class-methods-use-this":          ["warn"],
        "complexity":                      ["warn", {
            "max": 15
        }],
        "consistent-return":               ["warn"],
        "consistent-this":                 ["warn"],
        "curly":                           ["error", "all"],
        "default-case":                    ["warn"],
        "default-case-last":               ["warn"],
        "default-param-last":              ["error"],
        "eqeqeq":                          ["warn", "smart"],
        "grouped-accessor-pairs":          ["warn", "setBeforeGet"],
        "guard-for-in":                    ["warn"],
        "max-classes-per-file":            ["warn", 2],
        "max-depth":                       ["warn", 5],
        "max-lines":                       ["warn", {
            "max":            400,
            "skipBlankLines": true,
            "skipComments":   true
        }],
        "max-lines-per-function":          ["warn", {
            "max":            50,
            "skipBlankLines": true,
            "skipComments":   true
        }],
        "max-nested-callbacks":            ["warn", 10],
        "no-alert":                        ["error"],
        "no-array-constructor":            ["warn"],
        "no-bitwise":                      ["error"],
        "no-caller":                       ["error"],
        "no-confusing-arrow":              ["warn"],
        "no-empty-function":               ["warn"],
        "no-eq-null":                      ["warn"],
        "no-eval":                         ["error"],
        "no-extend-native":                ["error"],
        "no-floating-decimal":             ["warn"],
        "no-implicit-globals":             ["off"],
        "no-implied-eval":                 ["error"],
        "no-lone-blocks":                  ["error"],
        "no-proto":                        ["error"],
        "no-script-url":                   ["error"],
        "no-throw-literal":                ["warn"],
        "no-undef-init":                   ["warn"],
        "no-undefined":                    ["warn"],
        "no-unused-expressions":           ["warn"],
        "no-useless-call":                 ["warn"],
        "no-useless-constructor":          ["warn"],
        "no-useless-rename":               ["warn"],
        "no-useless-return":               ["warn"],
        "no-var":                          ["error"],
        "no-void":                         ["error"],
        "prefer-arrow-callback":           ["warn"],
        "prefer-const":                    ["warn"],
        "prefer-destructuring":            ["warn"],
        "sort-imports":                    ["warn"],
        "spaced-comment":                  ["warn", "always"],


        // Layout & Formatting ------------------------------------------------
        "array-bracket-newline":           ["warn", "consistent"],
        "array-bracket-spacing":           ["warn"],
        "array-element-newline":           ["warn", "consistent"],
        "arrow-parens":                    ["warn"],
        "arrow-spacing":                   ["warn"],
        "block-spacing":                   ["warn"],
        "brace-style":                     ["warn", "1tbs"],
        "comma-spacing":                   ["warn"],
        "dot-location":                    ["warn", "property"],
        "eol-last":                        ["warn"],
        "indent":                          ["warn", 4],
        "lines-around-comment":            ["warn", {
            "beforeBlockComment": true
        }],
        "lines-between-class-members":     ["warn"],
        "max-len":                         ["warn", {
            "code": 120,
            "ignoreComments":         true,
            "ignoreTrailingComments": true,
            "ignoreUrls":             true
        }],
        "new-parens":                      ["warn"],
        "no-multi-spaces":                 ["warn", {
            "exceptions": {
                "ImportDeclaration":  true,
                "Property":           true,
                "VariableDeclarator": true
            }
        }],
        "no-multiple-empty-lines":         ["warn", {
            "max": 2
        }],
        "no-tabs":                         ["warn"],
        "no-trailing-spaces":              ["warn"],
        "no-whitespace-before-property":   ["warn"],
        "object-curly-spacing":            ["warn", "always"],
        "quotes":                          ["warn", "double"],
        "semi":                            ["warn"],
        "semi-style":                      ["warn"],
        "space-before-blocks":             ["warn"],
        "space-before-function-paren":     ["warn"],
        "space-in-parens":                 ["warn"]
    }

};
