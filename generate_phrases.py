#To run the python code,  type this in the terminal : - python generate_phrases.py
# Also need to imprort the OpenAI library, which can be done by running : - python -m pip install openai

import json
import os
from typing import List, Dict

from openai import OpenAI


def load_env_key(env_path: str, key: str) -> str:
    if not os.path.exists(env_path):
        return ""
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            if k.strip() == key:
                return v.strip().strip('"').strip("'")
    return ""


def main() -> None:
    env_key = os.environ.get("OPENAI_API_KEY", "")
    if not env_key:
        env_key = load_env_key(".env", "OPENAI_API_KEY")
    if not env_key:
        raise SystemExit("Missing OPENAI_API_KEY (set env var or .env).")

    client = OpenAI(api_key=env_key)

    sound_requests: List[Dict[str, object]] = [
        {
            "prompt": "Sharp parrot scream layered with storm wind and distant animal calls, wild and dramatic.",
            "duration": 6.0,
            "filename": "sound_1.wav",
        },
        {
            "prompt": "Fast deer breathing and rapid hoof movement through dense jungle brush, urgent and cinematic tension.",
            "duration": 10.0,
            "filename": "sound_2.wav",
        },
        {
            "prompt": "Intense rapid crab claw clicks on wet stone mixed with sudden fish splashes in shallow water, rising echo.",
            "duration": 8.0,
            "filename": "sound_3.wav",
        },
        {
            "prompt": "Piercing eagle cry fading into deep owl hoots and distant wolf howl, dark jungle night, wide atmospheric reverb, while continue with whole duration",
            "duration": 15.0,
            "filename": "sound_4.wav",
        },
    ]

    negative_prompt = "Low quality."

    structured_prompt = {
        "role": "system",
        "content": (
            "Invent short fictional animal-language phrases. "
            "Use 3-5 words, made-up syllables, no English words, no punctuation. "
            "Keep a jungle cadence and match the mood of the sound prompt. "
            "Return only a JSON array of 16 strings, no extra text."
        ),
    }

    response = client.responses.create(
        model="gpt-4.1",
        temperature=1.5,
        input=[
            structured_prompt,
            {
                "role": "user",
                "content": (
                    "Generate 16 unique phrases. "
                    "Use the sound prompts and negative prompt as style guidance. "
                    "Do not include any headings, explanations, or labels. "
                    "Return only a JSON array of strings. "
                    f"sound_requests={json.dumps(sound_requests)}; "
                    f"negative_prompt={negative_prompt}"
                ),
            },
        ],
    )

    raw_text = response.output[0].content[0].text
    phrases = json.loads(raw_text)

    if not isinstance(phrases, list) or len(phrases) < 16:
        raise SystemExit(f"Expected JSON array with 16 phrases. Raw output:\n{raw_text}")

    with open("phrases.json", "w", encoding="utf-8") as f:
        json.dump(phrases[:16], f, ensure_ascii=False, indent=2)

    print("Wrote phrases.json")


if __name__ == "__main__":
    main()
