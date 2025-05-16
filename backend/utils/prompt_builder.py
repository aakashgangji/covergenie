def build_prompt(resume_data, job_desc, company, title):
    return f"""
You are an expert career assistant. Write a short, personalized, and humanized cover letter paragraph that aligns the candidate's resume with the job requirements.

## Candidate Resume:
{resume_data}

## Job Description:
{job_desc}

## Company: {company}
## Job Title: {title}

Only return the cover letter in the following format:

Dear Hiring Manager,

[One paragraph cover letter that clearly matches the candidate's strengths with the company and job description.]

Sincerely
"""
