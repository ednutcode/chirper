# File: tts.py

import os
import time
import requests
from pathlib import Path
from zipfile import ZipFile

VOICE_DIR = Path("voice")
ZIP_NAME = "voice.zip"
DEBUG_LOG = Path("debug_qa.log")

def fetch_voices(api_key: str):
    url = 'https://api.elevenlabs.io/v1/voices'
    headers = {'xi-api-key': api_key}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json().get('voices', [])

def display_voices(voices):
    print("\nAvailable Voices:")
    for i, voice in enumerate(voices):
        print(f"[{i}] {voice['name']} ({voice['voice_id']})")

def select_voice(voices):
    index = input("Select a voice by number: ")
    while not index.isdigit() or int(index) not in range(len(voices)):
        index = input("Invalid number. Try again: ")
    return voices[int(index)]['voice_id']

def read_text_file(file_path):
    try:
        return file_path.read_text(encoding='utf-8').strip()
    except UnicodeDecodeError:
        return file_path.read_text(encoding='latin-1').strip()

def generate_audio(text, voice_id, api_key):
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}'
    headers = {
        'xi-api-key': api_key,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json'
    }
    payload = {
        'text': text,
        'model_id': 'eleven_monolingual_v1',
        'voice_settings': {
            'stability': 0.75,
            'similarity_boost': 0.75
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        return response.content
    elif response.status_code == 401:
        raise Exception("401 Unauthorized. Check your API key.")
    elif response.status_code == 429:
        time.sleep(5)
        return generate_audio(text, voice_id, api_key)
    else:
        response.raise_for_status()

def save_audio(data, path):
    with path.open('wb') as f:
        f.write(data)

def log_qa(input_name, input_text, output_name):
    with DEBUG_LOG.open("a", encoding="utf-8") as f:
        f.write(f"\n=== QA for {input_name} ===\n")
        f.write(f"Text:\n{input_text}\n")
        f.write(f"Output File: {output_name}\n")
        f.write("="*40 + "\n")

def main():
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        print("Please set ELEVENLABS_API_KEY environment variable.")
        return

    voices = fetch_voices(api_key)
    display_voices(voices)
    voice_id = select_voice(voices)

    if not VOICE_DIR.exists():
        print(f"Directory '{VOICE_DIR}' not found.")
        return

    files = list(VOICE_DIR.glob("*.txt"))
    if not files:
        print("No .txt files found.")
        return

    for file_path in files:
        print(f"Processing: {file_path.name}")
        try:
            text = read_text_file(file_path)
            if not text:
                print(f"Skipped empty file: {file_path.name}")
                continue

            audio_data = generate_audio(text, voice_id, api_key)
            mp3_file = file_path.with_suffix(".mp3")
            save_audio(audio_data, mp3_file)
            log_qa(file_path.name, text, mp3_file.name)
            print(f"Saved: {mp3_file.name}")

        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")

    zip_path = VOICE_DIR / ZIP_NAME
    with ZipFile(zip_path, 'w') as zipf:
        for mp3_file in VOICE_DIR.glob("*.mp3"):
            zipf.write(mp3_file, arcname=mp3_file.name)
    print(f"Zipped all audio to {zip_path}")
    print("Done.")

if __name__ == "__main__":
    main()
