import logging
import requests
import fal_client
from ..config import Config

def fal_generate_and_save_audio(word: str, target_file_path: str):
    logging.debug(f"FAL audio generation for word [{word}]")

    handler = fal_client.submit(
        "fal-ai/minimax/speech-2.6-turbo",
        arguments={
            "text": word,
            # "voice": "..." # Optional voice parameter if we want to customize
        },
    )

    result = handler.get()
    
    # Result should contain audio_url
    # Schema check required based on docs, usually result['audio']['url'] or similar.
    # Assuming standard Fal media response. 
    # Let's assume result['audio']['url'] based on common patterns, verifying user provided doc details...
    # User provided doc was for FLUX, not Minimax. Assuming 'audio_url' or similar. 
    # Usually: {'audio_url': '...'} or {'audio': {'url': '...'}}
    
    # Safest approach: print result to debug log if strict schema unknown, but we need to code it now.
    # Common Fal pattern for single output is direct key or inside object.
    # Let's try to find the URL.
    
    audio_url = None
    if 'audio' in result and isinstance(result['audio'], dict) and 'url' in result['audio']:
         audio_url = result['audio']['url']
    elif 'audio_url' in result:
         audio_url = result['audio_url']
    elif 'url' in result:
         # sometimes root url if it's the only output
         audio_url = result['url']
    else:
        # Fallback inspection
        logging.error(f"Unknown FAL audio result format: {result}")
        raise ValueError("Could not parse FAL audio result")

    logging.debug(f"FAL generated audio URL: {audio_url}")
    
    # Download the audio file
    response = requests.get(audio_url)
    if response.status_code == 200:
        with open(target_file_path, 'wb') as f:
            f.write(response.content)
    else:
        raise Exception(f"Failed to download audio from {audio_url}, status code: {response.status_code}")
