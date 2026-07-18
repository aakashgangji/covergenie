import re


def clean_text(text):
    if not text:
        return ""

    # Normalize odd whitespace characters.
    normalized = (
        text.replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace("\u00a0", " ")
        .replace("\u200b", "")
    )

    # Split by lines first so we can preserve structure.
    raw_lines = normalized.split("\n")

    # Common UI noise seen in scraped job pages.
    noise_lines = {
        "show more",
        "show less",
        "see more",
        "see less",
        "read more",
        "read less",
        "apply",
        "easy apply",
    }

    cleaned_lines = []
    for line in raw_lines:
        line = re.sub(r"[ \t]+", " ", line).strip()
        if not line:
            continue
        if line.lower() in noise_lines:
            continue
        cleaned_lines.append(line)

    # De-duplicate immediate repeated lines from dynamic UIs.
    deduped_lines = []
    for line in cleaned_lines:
        if deduped_lines and deduped_lines[-1].lower() == line.lower():
            continue
        deduped_lines.append(line)

    # Keep short section-style formatting without excessive blank space.
    result = "\n".join(deduped_lines)
    result = re.sub(r"\n{3,}", "\n\n", result).strip()
    return result
