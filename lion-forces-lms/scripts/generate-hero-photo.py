#!/usr/bin/env python3
"""One-off script to generate the Home hero photo via Gemini image generation.
Not part of the app -- run once, save the output into public/images/, then
this script (and the API key) are no longer needed at runtime."""
import os
import sys

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Error: google-genai package not installed. Run: pip install google-genai")
    sys.exit(1)

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY not set")
    sys.exit(1)

PROMPT = """Generate a photorealistic, professional portrait photograph:

A confident young Pakistani man in his early twenties, smart professional
attire (crisp white collared shirt, no tie, sleeves neatly rolled or a
simple navy blazer), determined and inspiring expression, direct eye
contact with the camera, slight confident smile. Three-quarter body shot,
studio portrait lighting with soft rim light. Background is a smooth
deep teal-to-dark-teal gradient (hex approximately #0f4c47 to #06211f),
softly lit, no distracting objects, no text, no logos, no watermarks.
Sharp focus on the subject, shallow depth of field, high-end editorial
photography style suitable for a defense academy exam-prep website hero
section. Vertical portrait orientation. Realistic skin texture and
lighting, not illustrated, not cartoon, not 3D render.
"""

def main():
    client = genai.Client(api_key=API_KEY)
    model = "gemini-3-pro-image-preview"
    print(f"Generating with {model}...")

    try:
        response = client.models.generate_content(
            model=model,
            contents=PROMPT,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(aspect_ratio="3:4"),
            ),
        )
    except Exception as e:
        print(f"Pro model failed ({e}), falling back to Flash...")
        model = "gemini-2.5-flash-image"
        response = client.models.generate_content(
            model=model,
            contents=PROMPT,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                image_config=types.ImageConfig(aspect_ratio="3:4"),
            ),
        )

    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "images")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "hero-candidate.png")

    saved = False
    for part in response.candidates[0].content.parts:
        if getattr(part, "inline_data", None) and part.inline_data.mime_type.startswith("image/"):
            with open(out_path, "wb") as f:
                f.write(part.inline_data.data)
            saved = True
            print(f"Saved: {out_path}")
        elif getattr(part, "text", None):
            print("Model text output:", part.text)

    if not saved:
        print("No image returned in response.")
        sys.exit(1)

if __name__ == "__main__":
    main()
