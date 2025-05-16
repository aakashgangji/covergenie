document.getElementById("generate").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const errorDiv = document.getElementById("error");
    const coverLetterDiv = document.getElementById("cover-letter");
    const previewText = document.getElementById("preview-text");
    const generateButton = document.getElementById("generate");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    const downloadButton = document.getElementById("download");
  
    // Reset UI
    errorDiv.style.display = "none";
    coverLetterDiv.style.display = "none";
    editButton.style.display = "none";
    saveButton.style.display = "none";
    downloadButton.style.display = "none";
    generateButton.disabled = true;
    generateButton.textContent = "Generating...";
  
    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_JOB" }, async (response) => {
      if (chrome.runtime.lastError || !response || !response.payload) {
        errorDiv.textContent = "Failed to extract job data.";
        errorDiv.style.display = "block";
        generateButton.disabled = false;
        generateButton.textContent = "Generate Cover Letter";
        return;
      }
  
      const jobData = response.payload;
      previewText.textContent = jobData.description; // Show full description
  
      try {
        const res = await fetch("http://localhost:8000/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_description: jobData.description,
            title: jobData.title,
            company: jobData.company
          }),
        });
  
        const data = await res.json();
        
        if (data.success) {
          coverLetterDiv.textContent = data.cover_letter;
          coverLetterDiv.style.display = "block";
          editButton.style.display = "block";
          downloadButton.style.display = "block";
        } else {
          errorDiv.textContent = data.error || "Failed to generate cover letter.";
          errorDiv.style.display = "block";
        }
      } catch (err) {
        errorDiv.textContent = "Failed to connect to the server. Please make sure the backend is running.";
        errorDiv.style.display = "block";
      } finally {
        generateButton.disabled = false;
        generateButton.textContent = "Generate Cover Letter";
      }
    });
});

// Add edit functionality for cover letter
document.getElementById("edit").addEventListener("click", () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    const downloadButton = document.getElementById("download");
    
    coverLetterDiv.contentEditable = "true";
    coverLetterDiv.classList.add("editable");
    editButton.style.display = "none";
    saveButton.style.display = "block";
    downloadButton.style.display = "none";
});

// Add save functionality for cover letter
document.getElementById("save").addEventListener("click", () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    const downloadButton = document.getElementById("download");
    
    coverLetterDiv.contentEditable = "false";
    coverLetterDiv.classList.remove("editable");
    editButton.style.display = "block";
    saveButton.style.display = "none";
    downloadButton.style.display = "block";
});

// Add edit functionality for job description
document.getElementById("edit-preview").addEventListener("click", () => {
    const previewText = document.getElementById("preview-text");
    const previewBox = document.getElementById("preview");
    const editPreviewButton = document.getElementById("edit-preview");
    
    if (previewText.contentEditable === "true") {
        previewText.contentEditable = "false";
        previewBox.classList.remove("editable");
        editPreviewButton.textContent = "Edit";
    } else {
        previewText.contentEditable = "true";
        previewBox.classList.add("editable");
        editPreviewButton.textContent = "Done";
    }
});

// Add download functionality
document.getElementById("download").addEventListener("click", () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const content = coverLetterDiv.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Reset state when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    const downloadButton = document.getElementById("download");
    const previewText = document.getElementById("preview-text");
    const previewBox = document.getElementById("preview");
    const editPreviewButton = document.getElementById("edit-preview");

    // Reset cover letter state
    coverLetterDiv.style.display = "none";
    coverLetterDiv.contentEditable = "false";
    coverLetterDiv.classList.remove("editable");
    editButton.style.display = "none";
    saveButton.style.display = "none";
    downloadButton.style.display = "none";

    // Reset preview state
    previewText.contentEditable = "false";
    previewBox.classList.remove("editable");
    editPreviewButton.textContent = "Edit";
});