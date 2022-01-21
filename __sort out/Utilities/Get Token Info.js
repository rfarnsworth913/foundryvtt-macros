/* ==========================================================================
    Macro:              Debug Info
    Description:        Get information about the selected token
    Usage:              Select token on the canvas, and push macro
  ========================================================================== */

// Global variables -----------------------------------------------------------
const selectedToken = token;

// Data checks ----------------------------------------------------------------
if (!selectedToken) {
    ui.notifications.error("No token was selected!");
    return console.error("No token was selected!");
}

// Macro action logic ---------------------------------------------------------
console.group("Selected token information");
console.info("Token: ", selectedToken);
console.info("Actor: ", actor);
console.groupEnd();
