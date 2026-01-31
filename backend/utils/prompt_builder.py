def format_resume_data(resume_data):
    """Format resume data into a readable string for the prompt. Matches resume_data.json structure."""
    formatted = []

    # Contact (name, email, location, linkedin, website)
    if "contact" in resume_data:
        contact = resume_data["contact"]
        formatted.append(f"Name: {contact.get('name', 'N/A')}")
        formatted.append(f"Email: {contact.get('email', 'N/A')}")
        formatted.append(f"Location: {contact.get('location', 'N/A')}")
        if contact.get("linkedin"):
            formatted.append(f"LinkedIn: {contact.get('linkedin')}")
        if contact.get("website"):
            formatted.append(f"Website: {contact.get('website')}")

    # Professional Summary
    if resume_data.get("professional_summary"):
        formatted.append("\n## Professional Summary:")
        formatted.append(resume_data["professional_summary"])

    # Education (institution, degree, gpa, period)
    if resume_data.get("education"):
        formatted.append("\n## Education:")
        for edu in resume_data["education"]:
            line = f"- {edu.get('degree', '')} from {edu.get('institution', '')}"
            if edu.get("period"):
                line += f" ({edu['period']})"
            formatted.append(line)
            if edu.get("gpa"):
                formatted.append(f"  GPA: {edu['gpa']}")

    # Experience (company, role, location, period, responsibilities)
    if resume_data.get("experience"):
        formatted.append("\n## Professional Experience:")
        for exp in resume_data["experience"]:
            formatted.append(f"- {exp.get('role', '')} at {exp.get('company', '')}")
            if exp.get("location"):
                formatted.append(f"  Location: {exp['location']}")
            if exp.get("period"):
                formatted.append(f"  Period: {exp['period']}")
            if exp.get("responsibilities"):
                for resp in exp["responsibilities"][:4]:
                    formatted.append(f"  • {resp}")

    # Projects (name, achievement, description)
    if resume_data.get("projects"):
        formatted.append("\n## Key Projects:")
        for proj in resume_data["projects"]:
            formatted.append(f"- {proj.get('name', '')}")
            if proj.get("achievement"):
                formatted.append(f"  Achievement: {proj['achievement']}")
            if proj.get("description"):
                for desc in proj["description"][:3]:
                    formatted.append(f"  • {desc}")

    # Skills & Certifications (nested categories)
    if resume_data.get("skills_certifications"):
        formatted.append("\n## Skills & Certifications:")
        skills = resume_data["skills_certifications"]
        for category, items in skills.items():
            if items:
                label = category.replace("_", " ").title()
                formatted.append(f"  {label}: {', '.join(items[:8])}")

    # Publications & Certifications (flat list)
    if resume_data.get("publications_certifications"):
        formatted.append("\n## Publications & Certifications:")
        formatted.append(", ".join(resume_data["publications_certifications"][:8]))

    return "\n".join(formatted)


def build_prompt(resume_data, job_desc, company, title):
    """Build a comprehensive prompt for cover letter generation based on resume_data.json structure."""
    formatted_resume = format_resume_data(resume_data)

    prompt = f"""You are an expert career coach and professional writer. Write a cover letter that connects this candidate's profile to the job. Use only the information provided in the candidate profile below.

## CANDIDATE PROFILE:
{formatted_resume}

## JOB OPPORTUNITY:
**Position:** {title}
**Company:** {company}

## JOB DESCRIPTION:
{job_desc}

## INSTRUCTIONS:
Write a professional, ATS-friendly cover letter that:

1. **Salutation:** Use exactly "To the Hiring Manager," (do not add the company name).

2. **Body:** Write exactly ONE paragraph of 4–5 sentences that:
   - Opens with a clear statement of interest in this role and company.
   - Ties the candidate's professional summary and experience (e.g., data analysis, ETL, dashboards, SQL, Python, Tableau, Power BI) to the job requirements.
   - Mentions 1–2 concrete outcomes (e.g., retention improvement, automation, data quality) from their experience or projects.
   - Shows understanding of the role and how the candidate would add value.

3. **Closing:** End with "Sincerely," then a blank line (no name or signature line).

4. **Tone:** Professional, confident, and specific. No generic filler. Match wording to the job description where it fits naturally.

5. **Length:** One paragraph only; no more than 5 sentences total.

## OUTPUT FORMAT:
Dear Hiring Manager,

[One paragraph, 4–5 sentences]

Sincerely,

---

IMPORTANT: Output only the cover letter text. No explanations, notes, or extra commentary. The text must be ready to paste or download as-is."""

    return prompt
