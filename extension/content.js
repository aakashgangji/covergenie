// Function to extract job data
function extractJobData() {
    let title, company, description;

    // LinkedIn parsing
    if (window.location.hostname.includes('linkedin.com')) {
        // Try multiple selectors for LinkedIn job title
        const titleSelectors = [
            '.job-details-jobs-unified-top-card__job-title',
            '.jobs-unified-top-card__job-title',
            '.jobs-details-top-card__job-title',
            'h1.jobs-details-top-card__job-title',
            'h1[data-test-id="job-title"]',
            'h1'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim()) {
                title = element.innerText.trim();
                break;
            }
        }
        
        // Try multiple selectors for LinkedIn company name
        const companySelectors = [
            '.job-details-jobs-unified-top-card__company-name',
            '.jobs-unified-top-card__company-name',
            '.jobs-details-top-card__company-name',
            '.job-details-jobs-unified-top-card__primary-description',
            'a[data-test-id="job-company-name"]',
            '.jobs-company__box a'
        ];
        
        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim()) {
                company = element.innerText.trim();
                break;
            }
        }
        
        // Try multiple selectors for LinkedIn job description
        const descSelectors = [
            '.jobs-description__content',
            '.jobs-description-content__text',
            '.job-details-jobs-unified-top-card__job-description',
            '.jobs-box__html-content',
            '[data-test-id="job-description"]',
            '.jobs-description'
        ];
        
        for (const selector of descSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim()) {
                description = element.innerText.trim();
                break;
            }
        }
    }
    // Handshake parsing
    else if (window.location.hostname.includes('joinhandshake.com')) {
        // Try multiple selectors for Handshake job title
        const titleSelectors = [
            'h1[class*="title"]',
            'h1[class*="Title"]',
            '.posting-title',
            '.posting-header__title',
            'h1.posting-title',
            'h1[data-testid="posting-title"]',
            '[data-testid*="title"]',
            'h1',
            '[role="heading"][aria-level="1"]'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim() && element.innerText.trim().length > 3) {
                title = element.innerText.trim();
                break;
            }
        }
        
        // Try multiple selectors for Handshake company name
        const companySelectors = [
            'a[href*="/employers/"]',
            'a[href*="/employer/"]',
            '[class*="company"][class*="name"]',
            '[class*="Company"]',
            '.posting-company-name',
            '.posting-company',
            '.posting-header__company',
            '.posting-header__company-name',
            '[data-testid="posting-company"]',
            '[data-testid*="company"]',
            'a[href*="company"]'
        ];
        
        for (const selector of companySelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim() && element.innerText.trim().length > 1) {
                const text = element.innerText.trim();
                // Skip if it's too long (likely not a company name)
                if (text.length < 100) {
                    company = text;
                    break;
                }
            }
        }
        
        // Try multiple selectors for Handshake job description - be more aggressive
        const descSelectors = [
            '[class*="description"]',
            '[class*="Description"]',
            '[id*="description"]',
            '[id*="Description"]',
            '.posting-description',
            '.posting-content',
            '.posting-description__content',
            '.posting-description-content',
            '[data-testid="posting-description"]',
            '[data-testid*="description"]',
            '.posting-body',
            'main [class*="content"]',
            'main [class*="body"]',
            '[role="main"] [class*="content"]'
        ];
        
        for (const selector of descSelectors) {
            const element = document.querySelector(selector);
            if (element && element.innerText && element.innerText.trim()) {
                const text = element.innerText.trim();
                // Make sure it's substantial content (more than just a few words)
                if (text.length > 100) {
                    description = text;
                    break;
                }
            }
        }
        
        // If still no description, try to find the main content area
        if (!description || description.length < 100) {
            // Look for main content sections
            const mainContent = document.querySelector('main') || 
                               document.querySelector('[role="main"]') ||
                               document.querySelector('article') ||
                               document.body;
            
            if (mainContent) {
                // Try to find the largest text block that's likely the description
                const allDivs = mainContent.querySelectorAll('div, section, article');
                let maxLength = 0;
                let bestMatch = null;
                
                for (const div of allDivs) {
                    const text = div.innerText?.trim() || '';
                    // Skip if it contains the title or company (likely header)
                    if (text.length > maxLength && 
                        text.length > 200 && 
                        !text.includes(title) &&
                        text.length < 50000) { // reasonable max
                        maxLength = text.length;
                        bestMatch = text;
                    }
                }
                
                if (bestMatch) {
                    description = bestMatch;
                }
            }
        }
    }
    // Generic fallback
    else {
        // Try to find title in common locations
        title = document.querySelector('h1')?.innerText?.trim() || 
                document.querySelector('[class*="title"]')?.innerText?.trim() ||
                document.querySelector('[id*="title"]')?.innerText?.trim() ||
                "Job Title";
        
        // Try to find company name
        company = document.querySelector('a[href*="company"]')?.innerText?.trim() ||
                 document.querySelector('[class*="company"]')?.innerText?.trim() ||
                 document.querySelector('[id*="company"]')?.innerText?.trim() ||
                 "Company Name";
        
        // Try to get description from common content areas
        description = document.querySelector('[class*="description"]')?.innerText?.trim() ||
                     document.querySelector('[id*="description"]')?.innerText?.trim() ||
                     document.querySelector('main')?.innerText?.trim() ||
                     document.body.innerText?.slice(0, 4000).trim() ||
                     "Job description not found.";
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
        let responseSent = false;
        
        const sendData = (data) => {
            if (!responseSent) {
                responseSent = true;
                console.log('[CoverGenie] Sending job data:', {
                    title: data.title,
                    company: data.company,
                    descriptionLength: data.description.length
                });
                sendResponse({ payload: data });
            }
        };
        
        // Try to extract data immediately
        let jobData = extractJobData();
        
        console.log('[CoverGenie] Initial extraction:', {
            title: jobData.title,
            company: jobData.company,
            descriptionLength: jobData.description.length,
            url: window.location.href
        });
        
        // If we have a good description, send immediately
        if (jobData.description && 
            jobData.description !== "Job description not found." && 
            jobData.description.length > 100 &&
            jobData.company !== "Company Name") {
            sendData(jobData);
            return true;
        }
        
        // Use MutationObserver to watch for content changes (for dynamic pages)
        const observer = new MutationObserver(() => {
            const newData = extractJobData();
            if (newData.description && 
                newData.description !== "Job description not found." && 
                newData.description.length > 100) {
                observer.disconnect();
                if (!responseSent) {
                    sendData(newData);
                }
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // Also try multiple times with increasing delays
        const retries = [1000, 2000, 4000];
        retries.forEach((delay, index) => {
            setTimeout(() => {
                if (!responseSent) {
                    jobData = extractJobData();
                    console.log(`[CoverGenie] Retry ${index + 1} extraction:`, {
                        title: jobData.title,
                        company: jobData.company,
                        descriptionLength: jobData.description.length
                    });
                    
                    // Send if we have good data, or on final retry
                    if ((jobData.description && 
                         jobData.description !== "Job description not found." && 
                         jobData.description.length > 100) ||
                        index === retries.length - 1) {
                        observer.disconnect();
                        sendData(jobData);
                    }
                }
            }, delay);
        });
        
        return true; // Keep the message channel open for async response
    }
    
    return false;
});