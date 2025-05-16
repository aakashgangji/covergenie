import json
import uuid

def save_json_and_txt(content: str):
    base_filename = f"cover_letter_{uuid.uuid4().hex}"
    json_path = f"/tmp/{base_filename}.json"
    txt_path = f"/tmp/{base_filename}.txt"

    with open(json_path, "w") as jf:
        json.dump({"cover_letter": content}, jf, indent=2)

    with open(txt_path, "w") as tf:
        tf.write(content)

    return txt_path
