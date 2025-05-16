def build_prompt(resume_data, job_desc, company, title):
    return f"""
You are an expert career assistant. Write a concise, personalized cover letter that aligns the candidate's resume with the job requirements.

## Candidate Resume:
{resume_data}

## Job Description:
{job_desc}

## Company: {company}
## Job Title: {title}

Write a cover letter that:
1. Uses only "Dear Hiring Manager" as the salutation (do not add company name)
2. Contains exactly one paragraph with 4-5 sentences
3. Clearly matches the candidate's strengths with the job requirements
4. Is professional and engaging

Format:
Dear Hiring Manager,

[One paragraph with 4-5 sentences that clearly matches the candidate's strengths with the company and job description.]

Sincerely
"""
