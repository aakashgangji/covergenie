function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
}

function isLikelySidebarOrSuggestedText(text) {
    const lower = text.toLowerCase();
    const blockedPhrases = [
        "suggested for you",
        "filters",
        "refresh",
        "how can i leverage",
        "where can i find roles",
        "apply directly via handshake",
        "search",
        "recommended"
    ];
    return blockedPhrases.some((phrase) => lower.includes(phrase));
}

function trimHandshakeDescriptionBoundaries(text) {
    if (!text) return text;
    const source = normalizeText(text);
    const lower = source.toLowerCase();

    // Start from "job description" when present.
    const startMarkers = ["job description"];
    let startIdx = 0;
    for (const marker of startMarkers) {
        const idx = lower.indexOf(marker);
        if (idx !== -1) {
            startIdx = idx;
            break;
        }
    }

    // Stop at sections that are not part of JD body.
    const endMarkers = [
        "what they're looking for",
        "about the employer",
        "similar jobs",
        "save share apply",
        "at a glance",
        "matching is based on your profile",
        "learn more about cohesion labs"
    ];
    let endIdx = source.length;
    for (const marker of endMarkers) {
        const idx = lower.indexOf(marker, startIdx + 10);
        if (idx !== -1 && idx < endIdx) {
            endIdx = idx;
        }
    }

    return source.slice(startIdx, endIdx).trim();
}

function clickHandshakeMoreButton() {
    if (!window.location.hostname.includes("joinhandshake.com")) {
        return false;
    }

    const candidates = Array.from(document.querySelectorAll("button, a, [role='button']"));
    for (const el of candidates) {
        const label = normalizeText(el.innerText || el.textContent).toLowerCase();
        if (label !== "more") {
            continue;
        }

        // Prefer "More" controls near job description content.
        const containerText = normalizeText(el.closest("section, article, div")?.innerText || "").toLowerCase();
        if (containerText.includes("job description") || containerText.includes("about cohesion labs")) {
            try {
                // Guard against detached nodes while the page rerenders.
                if (el.isConnected) {
                    el.click();
                    return true;
                }
            } catch (_err) {
                // Ignore click issues and continue trying other buttons.
            }
        }
    }

    return false;
}

function expandAllHandshakeMoreButtons() {
    if (!window.location.hostname.includes("joinhandshake.com")) {
        return 0;
    }

    const clickables = Array.from(document.querySelectorAll("button, a, [role='button']"));
    let clicked = 0;
    for (const el of clickables) {
        const label = normalizeText(el.innerText || el.textContent).toLowerCase();
        if (label === "more" || label === "show more" || label === "read more") {
            try {
                if (el.isConnected && !el.disabled) {
                    el.click();
                    clicked += 1;
                }
            } catch (_err) {
                // Ignore detached node or transient render errors.
            }
        }
    }

    return clicked;
}

function isStrongHandshakeDescription(text) {
    const lower = normalizeText(text).toLowerCase();
    if (lower.length < 300) return false;
    if (!lower.includes("job description")) return false;

    const strongMarkers = [
        "the role",
        "what you'll do",
        "requirements",
        "nice to have",
        "why cohesion labs",
        "how to apply"
    ];
    const matches = strongMarkers.filter((m) => lower.includes(m)).length;
    return matches >= 2;
}

function extractHandshakeDescriptionFromWholePage() {
    const main = document.querySelector("main") || document.querySelector("[role='main']") || document.body;
    const full = normalizeText(main?.innerText || "");
    if (!full) return null;

    const regex = /job description\s*([\s\S]*?)(what they're looking for|about the employer|similar jobs|save share apply|at a glance|$)/i;
    const match = full.match(regex);
    if (!match || !match[0]) return null;

    const candidate = normalizeText(`Job description ${match[1] || ""}`);
    if (candidate.length < 120) return null;
    if (isLikelySidebarOrSuggestedText(candidate)) return null;
    return candidate;
}

function extractHandshakeDescriptionByKeywordWindow() {
    const full = normalizeText(document.body?.innerText || "");
    if (!full) return null;

    const lower = full.toLowerCase();
    const start = lower.indexOf("job description");
    if (start === -1) return null;

    const endMarkers = ["about the employer", "similar jobs", "what they're looking for"];
    let end = full.length;
    for (const marker of endMarkers) {
        const idx = lower.indexOf(marker, start + 20);
        if (idx !== -1 && idx < end) {
            end = idx;
        }
    }

    const candidate = normalizeText(full.slice(start, end));
    if (candidate.length < 150) return null;
    if (isLikelySidebarOrSuggestedText(candidate)) return null;
    return candidate;
}

function extractHandshakeJobDescriptionFromHeadings() {
    const headingCandidates = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, [role='heading']")
    );
    const targetHeading = headingCandidates.find((el) => {
        const text = normalizeText(el.innerText).toLowerCase();
        return text === "job description" || text.includes("job description");
    });

    if (!targetHeading) return null;

    // Gather text from the heading onward until we hit unrelated sections.
    const stopMarkers = [
        "what they're looking for",
        "about the employer",
        "similar jobs",
        "matching is based on your profile"
    ];

    const blocks = [];
    let node = targetHeading;
    let guard = 0;
    while (node && guard < 200) {
        const text = normalizeText(node.innerText || node.textContent);
        const lower = text.toLowerCase();
        if (text && !isLikelySidebarOrSuggestedText(text)) {
            if (stopMarkers.some((marker) => lower.includes(marker))) {
                break;
            }
            blocks.push(text);
        }

        node = node.nextElementSibling;
        guard += 1;
    }

    const merged = trimHandshakeDescriptionBoundaries(blocks.join("\n"));
    if (merged.length > 250) {
        return merged;
    }

    return null;
}

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
        
        // First, strongly target "Job description" heading region.
        const headingBasedDescription = extractHandshakeJobDescriptionFromHeadings();
        if (headingBasedDescription) {
            description = headingBasedDescription;
        }

        // Second, try slicing from whole page text between known boundaries.
        if (!description || description === "Job description not found." || description.length < 120) {
            const wholePageDescription = extractHandshakeDescriptionFromWholePage();
            if (wholePageDescription) {
                description = wholePageDescription;
            }
        }

        // Third, use a broader keyword-window slice from the full body text.
        if (!description || description === "Job description not found." || description.length < 120) {
            const windowDescription = extractHandshakeDescriptionByKeywordWindow();
            if (windowDescription) {
                description = windowDescription;
            }
        }

        // Try multiple selectors for Handshake job description - but filter out sidebar text.
        const descSelectors = [
            'section[class*="job"]',
            '[data-testid*="job-description"]',
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
        
        if (!description || description.length < 120) {
            for (const selector of descSelectors) {
                const elements = Array.from(document.querySelectorAll(selector));
                for (const element of elements) {
                    const text = normalizeText(element?.innerText);
                    // Ignore short blocks and recommendation/search widgets.
                    if (text.length > 180 && !isLikelySidebarOrSuggestedText(text)) {
                        description = trimHandshakeDescriptionBoundaries(text);
                        break;
                    }
                }
                if (description) {
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
                    const text = normalizeText(div.innerText);
                    // Skip if it contains the title or company (likely header)
                    if (text.length > maxLength && 
                        text.length > 250 &&
                        !isLikelySidebarOrSuggestedText(text) &&
                        !text.includes(title) &&
                        text.length < 50000) { // reasonable max
                        maxLength = text.length;
                        bestMatch = text;
                    }
                }
                
                if (bestMatch) {
                    description = trimHandshakeDescriptionBoundaries(bestMatch);
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

    const invalidMarkers = ["similar jobs", "suggested for you"];
    const descLower = description.toLowerCase();
    if (invalidMarkers.some((marker) => descLower.includes(marker))) {
        // Try one last clean slice before failing hard.
        const recovered = trimHandshakeDescriptionBoundaries(description);
        if (recovered && recovered !== "Job description not found." && recovered.length > 100) {
            description = recovered;
        } else {
            // Keep best effort text instead of forcing failure.
            description = description || "Job description not found.";
        }
    }

    // Reject "About the employer" snippets unless the text looks like a real JD.
    if (
        (descLower.startsWith("about the employer") || descLower.includes("about the employer")) &&
        !isStrongHandshakeDescription(description)
    ) {
        const recovered =
            extractHandshakeDescriptionByKeywordWindow() ||
            extractHandshakeDescriptionFromWholePage() ||
            trimHandshakeDescriptionBoundaries(description);
        if (recovered && recovered.length > 100) {
            description = recovered;
        } else {
            description = "Job description not found.";
        }
    }

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
        expandAllHandshakeMoreButtons();
        clickHandshakeMoreButton();
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
            expandAllHandshakeMoreButtons();
            clickHandshakeMoreButton();
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
                    expandAllHandshakeMoreButtons();
                    clickHandshakeMoreButton();
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