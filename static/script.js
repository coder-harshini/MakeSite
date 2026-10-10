
const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");
const emptyState = document.getElementById("emptyState");
const statusText = document.getElementById("status");

let generatedHTML = "";
let progressTimer = null;

function createProgressUI() {
    let loader = document.getElementById("generationLoader");

    if (!loader) {
        loader = document.createElement("div");
        loader.id = "generationLoader";
        loader.innerHTML = `
            <div class="loader-heading">
                <span id="loaderMessage">✨ Getting started...</span>
                <strong id="loaderPercent">0%</strong>
            </div>
            <div class="loader-track">
                <div id="loaderBar"></div>
            </div>
            <div class="loader-note">
                Please wait while your website is being created 💜
            </div>
        `;
        statusText.insertAdjacentElement("afterend", loader);
    }

    loader.style.display = "block";
}

function updateProgress(percent, message) {
    const bar = document.getElementById("loaderBar");
    const number = document.getElementById("loaderPercent");
    const text = document.getElementById("loaderMessage");

    if (bar) bar.style.width = `${percent}%`;
    if (number) number.textContent = `${percent}%`;
    if (text) text.textContent = message;
}

function startProgress() {
    let progress = 0;

    const messages = [
        "✨ Understanding your idea...",
        "🎨 Designing your website...",
        "💻 Writing the code...",
        "🌈 Adding finishing touches...",
        "🚀 Almost ready..."
    ];

    updateProgress(0, messages[0]);

    progressTimer = setInterval(() => {
        if (progress < 30) {
            progress += Math.random() * 5 + 2;
        } else if (progress < 60) {
            progress += Math.random() * 2 + 1;
        } else if (progress < 80) {
            progress += Math.random() * 0.8 + 0.3;
        } else {
            progress += Math.random() * 0.3 + 0.1;
        }

        progress = Math.min(90, progress);

        const index = Math.min(
            Math.floor(progress / 20),
            messages.length - 1
        );

        updateProgress(Math.floor(progress), messages[index]);
    }, 400);
}

function stopProgress() {
    if (progressTimer !== null) {
        clearInterval(progressTimer);
        progressTimer = null;
    }
}

generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        statusText.textContent = "Please describe the website you want first.";
        promptInput.focus();
        return;
    }

    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    generateBtn.textContent = "Creating...";
    statusText.textContent = "✨ MakeSite AI is building your website...";

    createProgressUI();
    startProgress();

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong.");
        }

        generatedHTML = result.html;
        preview.srcdoc = generatedHTML;
        emptyState.style.display = "none";
        downloadBtn.disabled = false;

        stopProgress();
        updateProgress(100, "🎉 Your website is ready!");
        statusText.textContent = "🎉 Your website is ready!";

    } catch (error) {
        stopProgress();

        const loader = document.getElementById("generationLoader");
        if (loader) loader.style.display = "none";

        statusText.textContent = "⚠️ " + error.message;

    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Website ↗";
    }
});

downloadBtn.addEventListener("click", () => {
    if (!generatedHTML) return;

    const blob = new Blob([generatedHTML], {
        type: "text/html;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "my-website.html";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

promptInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        generateBtn.click();
    }
});