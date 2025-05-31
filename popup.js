document.getElementById("view-logs").addEventListener("click", () => {
    chrome.tabs.create({ url: "logs.html" });
});
