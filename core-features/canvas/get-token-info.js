/* ==========================================================================
    Module:             Get Token Information
    Description:        Get selected token information
   ========================================================================== */
const selectedToken = token;

// Check for selection --------------------------------------------------------
if (!selectedToken) {
    ui.notifications.error("No token selected");
    return false;
}

// Output current section -----------------------------------------------------
console.group("Selected Token Information");
console.log(selectedToken);
console.groupEnd();
