def clean_text(text):
    import re
    return re.sub(r'\s+', ' ', text).strip()
