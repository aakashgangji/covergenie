def format_resume_data(resume_data):
    """Format resume data into a readable string for the prompt."""
    formatted = []
    
    # Name and Contact
    formatted.append(f"Name: {resume_data.get('name', 'N/A')}")
    if 'contact' in resume_data:
        contact = resume_data['contact']
        formatted.append(f"Email: {contact.get('email', 'N/A')}")
        formatted.append(f"Location: {contact.get('location', 'N/A')}")
    
    # Education
    if 'education' in resume_data and resume_data['education']:
        formatted.append("\n## Education:")
        for edu in resume_data['education']:
            formatted.append(f"- {edu.get('degree', '')} from {edu.get('school', '')}")
            if 'gpa' in edu:
                formatted.append(f"  GPA: {edu.get('gpa', '')}")
            if 'courses' in edu and edu['courses']:
                formatted.append(f"  Relevant Courses: {', '.join(edu['courses'][:5])}")
    
    # Experience
    if 'experience' in resume_data and resume_data['experience']:
        formatted.append("\n## Professional Experience:")
        for exp in resume_data['experience']:
            formatted.append(f"- {exp.get('title', '')} at {exp.get('company', '')}")
            if 'responsibilities' in exp and exp['responsibilities']:
                for resp in exp['responsibilities'][:3]:
                    formatted.append(f"  • {resp}")
    
    # Projects
    if 'projects' in resume_data and resume_data['projects']:
        formatted.append("\n## Key Projects:")
        for proj in resume_data['projects'][:3]:
            formatted.append(f"- {proj.get('name', '')}")
            if 'description' in proj and proj['description']:
                formatted.append(f"  {proj['description'][0]}")
            if 'technologies' in proj and proj['technologies']:
                formatted.append(f"  Technologies: {', '.join(proj['technologies'][:5])}")
    
    # Skills
    if 'skills' in resume_data:
        skills = resume_data['skills']
        skill_list = []
        if 'languages' in skills:
            skill_list.extend(skills['languages'])
        if 'frameworks' in skills:
            skill_list.extend(skills['frameworks'])
        if 'tools' in skills:
            skill_list.extend(skills['tools'])
        if skill_list:
            formatted.append(f"\n## Technical Skills: {', '.join(skill_list[:15])}")
    
    # Certifications
    if 'certifications' in resume_data and resume_data['certifications']:
        formatted.append(f"\n## Certifications: {', '.join(resume_data['certifications'][:5])}")
    
    return "\n".join(formatted)


def build_prompt(resume_data, job_desc, company, title):
    """Build a comprehensive prompt for cover letter generation."""
    formatted_resume = format_resume_data(resume_data)
    
    prompt = f"""You are an expert career coach and professional writer specializing in creating compelling, personalized cover letters. Your task is to write a cover letter that effectively bridges the candidate's qualifications with the specific job requirements.

## CANDIDATE PROFILE:
{formatted_resume}

## JOB OPPORTUNITY:
**Position:** {title}
**Company:** {company}

## JOB DESCRIPTION:
{job_desc}

## INSTRUCTIONS:
Write a professional cover letter that:

1. **Salutation:** Use exactly "Dear Hiring Manager," (do not include the company name)

2. **Body Paragraph:** Write exactly ONE paragraph containing 4-5 well-crafted sentences that:
   - Opens with a strong statement expressing genuine interest in the position
   - Highlights 2-3 specific qualifications from the candidate's background that directly match the job requirements
   - Demonstrates understanding of the role and company needs
   - Conveys enthusiasm and value proposition
   - Uses specific examples from the candidate's experience, projects, or skills when relevant

3. **Closing:** End with "Sincerely," followed by a blank line

4. **Tone:** Professional, confident, and authentic. Avoid generic phrases. Be specific about how the candidate's background aligns with the role.

5. **Length:** The entire cover letter should be concise - one paragraph only, no more than 5 sentences.

## OUTPUT FORMAT:
Dear Hiring Manager,

[Write your one paragraph here with 4-5 sentences]

Sincerely,

---

IMPORTANT: Only output the cover letter text. Do not include any explanations, notes, or additional commentary. The output should be ready to use as-is."""

    return prompt
