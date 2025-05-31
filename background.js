const GOOGLE_API_KEY = "AIzaSyClaEi8Aulqi7ZitcJTuk0htjWXJ89qoWY";  // Replace this with the new API key

async function checkPhishing(url) {
    try {
        const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;


        const requestBody = {
            client: { clientId: "chrome-extension", clientVersion: "1.0" },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: url }]
            }
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const isPhishing = data.matches !== undefined;

        return isPhishing ? "High" : "Low";
    } catch (error) {
        console.error("🚨 API Fetch Error:", error);
        return "Unknown";
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    const url = details.url;
    const riskLevel = await checkPhishing(url);

    chrome.storage.local.get({ scannedLinks: [] }, (storage) => {
        let logs = storage.scannedLinks || [];

        // Check if URL is already in logs to avoid duplicates
        const existingLog = logs.find(log => log.url === url);
        if (!existingLog) {
            logs.unshift({ url, risk: riskLevel }); // Add new log to the top
            if (logs.length > 20) logs.pop(); // Keep only the last 20 logs

            // Save updated logs
            chrome.storage.local.set({ scannedLinks: logs }, () => {
                console.log("✅ Log saved:", logs);
            });
        }
    });

    // Redirect if phishing
    if (riskLevel === "High") {
        alert("🚨 Warning: This website is flagged as phishing!\nRedirecting to a safe page.");
        chrome.tabs.update(details.tabId, { url: "https://www.google.com/search?q=phishing+safety" });
    }
}, { urls: ["<all_urls>"] });
