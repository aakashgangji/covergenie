document.getElementById("generate").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const errorDiv = document.getElementById("error");
    const coverLetterDiv = document.getElementById("cover-letter");
    const previewText = document.getElementById("preview-text");
    const generateButton = document.getElementById("generate");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
  
    // Reset UI
    errorDiv.style.display = "none";
    coverLetterDiv.style.display = "none";
    editButton.style.display = "none";
    saveButton.style.display = "none";
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
      previewText.textContent = jobData.description.slice(0, 200) + "...";
  
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

// Add edit functionality
document.getElementById("edit").addEventListener("click", () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    
    coverLetterDiv.contentEditable = "true";
    coverLetterDiv.classList.add("editable");
    editButton.style.display = "none";
    saveButton.style.display = "block";
});

// Add save functionality
document.getElementById("save").addEventListener("click", () => {
    const coverLetterDiv = document.getElementById("cover-letter");
    const editButton = document.getElementById("edit");
    const saveButton = document.getElementById("save");
    
    coverLetterDiv.contentEditable = "false";
    coverLetterDiv.classList.remove("editable");
    editButton.style.display = "block";
    saveButton.style.display = "none";
});