import logging

import replicate
from openai import OpenAI

from ..config import Config
from ..entities import WordWithContext

client = OpenAI()


def replicate_generate_image(prompt: str) -> str:
    logging.debug(f"Replicate image generation prompt [{prompt}]")

    replicate_client = replicate.Client(api_token=Config.REPLICATE_API_KEY)

    # This is for low cost, faster generation. Change for higher quality images.
    input = {
        "aspect_ratio": "3:2",
        "go_fast": True,
        "megapixels": "0.25",
        "num_outputs": 1,
        "output_format": "png",
        "output_quality": 100,
        "prompt": prompt
    }

    logging.info("Using Replicate model for image generation: " + Config.REPLICATE_MODEL_URL)

    output = replicate_client.run(
        Config.REPLICATE_MODEL_URL,
        input=input
    )

    print(output)

    image_url = output[0]
    logging.debug(f"Replicate generated image URL: {image_url}")
    return image_url
