import logging
import fal_client
from ..config import Config

def fal_generate_image(prompt: str) -> str:
    logging.debug(f"FAL image generation prompt [{prompt}]")
    
    # Ensure config key is available just in case, though usually env var is enough for fal_client 
    # if set via export FAL_KEY. 
    # But Config.FAL_KEY is set in config setup, handling it here if needed manually or 
    # relying on fal_client's auto-detection from os.environ.
    
    handler = fal_client.submit(
        "fal-ai/flux-2/flash",
        arguments={
            "prompt": prompt,
            "image_size": "square_hd" # or generic resolution if needed
        },
    )

    result = handler.get()
    
    # Result format usually: {'images': [{'url': '...', ...}], ...}
    image_url = result['images'][0]['url']
    
    logging.debug(f"FAL generated image URL: {image_url}")
    return image_url
