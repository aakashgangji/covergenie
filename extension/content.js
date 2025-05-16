// Function to extract job data
function extractJobData() {
    let title, company, description;

    // LinkedIn parsing
    if (window.location.hostname.includes('linkedin.com')) {
        // Try multiple selectors for LinkedIn
        title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.innerText || 
               document.querySelector('.jobs-unified-top-card__job-title')?.innerText ||
               document.querySelector('h1')?.innerText || 
               "Job Title";
        
        company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.innerText || 
                 document.querySelector('.jobs-unified-top-card__company-name')?.innerText ||
                 document.querySelector('.job-details-jobs-unified-top-card__primary-description')?.innerText || 
                 "Company Name";
        
        description = document.querySelector('.job-details-jobs-unified-top-card__job-description')?.innerText || 
                     document.querySelector('.jobs-description__content')?.innerText ||
                     document.querySelector('.jobs-description')?.innerText ||
                     document.querySelector('.jobs-box__html-content')?.innerText ||
                     "Job description not found.";
    }
    // Handshake parsing
    else if (window.location.hostname.includes('joinhandshake.com')) {
        title = document.querySelector('.posting-title')?.innerText || 
               document.querySelector('.posting-header__title')?.innerText ||
               document.querySelector('h1')?.innerText || 
               "Job Title";
        
        company = document.querySelector('.posting-company-name')?.innerText || 
                 document.querySelector('.posting-company')?.innerText ||
                 document.querySelector('.posting-header__company')?.innerText ||
                 "Company Name";
        
        description = document.querySelector('.posting-description')?.innerText || 
                     document.querySelector('.posting-content')?.innerText ||
                     document.querySelector('.posting-description__content')?.innerText ||
                     "Job description not found.";
    }
    // Generic fallback
    else {
        title = document.querySelector('h1')?.innerText || "Job Title";
        company = document.querySelector('a[href*="company"]')?.innerText || "Company Name";
        description = document.body.innerText?.slice(0, 4000) || "Job description not found.";
    }

    // Clean up the extracted text
    title = title?.trim() || "Job Title";
    company = company?.trim() || "Company Name";
    description = description?.trim()
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim() || "Job description not found.";

    return {
        title,
        company,
        description
    };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_JOB") {
        // Try to extract data immediately
        let jobData = extractJobData();
        
        // If description is not found, wait a bit and try again (for dynamic content)
        if (jobData.description === "Job description not found.") {
            setTimeout(() => {
                jobData = extractJobData();
                sendResponse({ payload: jobData });
            }, 1000);
            return true; // Keep the message channel open for the async response
        }
        
        sendResponse({ payload: jobData });
        return true;
    }
});