document.addEventListener("DOMContentLoaded", () => {
    const logList = document.getElementById("log-list");
    const clearLogsBtn = document.getElementById("clear-logs");
    const refreshLogsBtn = document.getElementById("refresh-logs");

    function loadLogs() {
        chrome.storage.local.get({ scannedLinks: [] }, (data) => {
            const logs = data.scannedLinks || [];
            logList.innerHTML = logs.length === 0 
                ? "<p>No logs found.</p>" 
                : logs.map(log => `
                    <li>
                        <span>URL:</span> ${log.url} <br>
                        <span>Risk:</span> <span style="color:${log.risk === 'High' ? 'red' : 'green'}">${log.risk}</span>
                    </li>
                `).join('');
        });
    }

    clearLogsBtn.addEventListener("click", () => {
        chrome.storage.local.set({ scannedLinks: [] }, () => {
            loadLogs();
            console.log("🚮 Logs cleared!");
        });
    });

    refreshLogsBtn.addEventListener("click", () => {
        loadLogs();
        console.log("🔄 Logs refreshed!");
    });

    loadLogs();
});
