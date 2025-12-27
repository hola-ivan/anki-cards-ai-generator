import argparse
import logging
import os
import sys
import json
import genanki
import random

# Add root to sys.path to allow imports from generator
sys.path.append(os.getcwd())

from generator.config import Config
from generator.entities import WordWithContext, CardRawDataV1
from generator.input import read_input_file
from generator import generate_cards
from generator.anki import card_formatter
from generator.anki.genanki_exporter import export_to_apkg

# Setup logger
logging.basicConfig(level=logging.INFO)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--task-dir', required=True)
    parser.add_argument('--deck-name', required=True)
    parser.add_argument('--language', required=True)
    parser.add_argument('--level', required=True)
    parser.add_argument('--openai-key', required=False) # Not required in mock mode
    parser.add_argument('--mock', action='store_true')
    
    args = parser.parse_args()
    
    # Configure global state (Config)
    Config.setup_logging()
    Config.set_processing_directory_path(args.task_dir)
    Config.set_anki_deck_name_or_use_default(args.deck_name)
    Config.set_language_or_use_default(args.language)
    Config.set_level_or_use_default(args.level)
    
    if not args.mock:
        if not args.openai_key:
             logging.error("OpenAI key required unless in --mock mode")
             sys.exit(1)
        Config.set_openai_key_or_use_default(args.openai_key)
    
    # Hack to satisfy media dir check without local Anki
    media_dir = os.path.join(args.task_dir, "media")
    os.makedirs(media_dir, exist_ok=True)
    Config.ANKI_MEDIA_DIRECTORY = media_dir
    
    # Read input
    input_file = os.path.join(args.task_dir, "input.csv")
    
    # Init status
    with open(os.path.join(args.task_dir, "status.json"), "w") as f:
        json.dump({"state": "processing", "progress": 0}, f)

    if not os.path.exists(input_file):
        logging.error("Input file not found")
        with open(os.path.join(args.task_dir, "status.json"), "w") as f:
             json.dump({"state": "error", "error": "Input file not found"}, f)
        sys.exit(1)
        
    try:
        input_words = read_input_file.read_file_based_on_extension(input_file)
    except Exception as e:
        logging.error(f"Failed to read input: {e}")
        with open(os.path.join(args.task_dir, "status.json"), "w") as f:
             json.dump({"state": "error", "error": str(e)}, f)
        sys.exit(1)

    # Generate
    cards_data = {}
    if args.mock:
        logging.info("Running in MOCK mode. Skipping AI generation.")
        from generator.entities import CardRawDataV1
        # Create a dummy image
        mock_image_path = os.path.join(args.task_dir, "mock_image.png")
        # create a simple blue square
        from PIL import Image
        img = Image.new('RGB', (300, 300), color = (73, 109, 137))
        img.save(mock_image_path)
        
        for w in input_words:
            # Mock card data
            card = CardRawDataV1(
                word=w.word,
                card_text=f"Mock explanation for {w.word}. Context: {w.context}",
                image_prompt="Mock prompt",
                image_url="http://mock.url",
                image_path=mock_image_path,
                audio_path="", # No audio in mock
                dictionary_url=f"http://example.com/dict/{w.word}"
            )
            cards_data[w] = card
    else:
        try:
            cards_data = generate_cards.generate_text_and_image(input_words)
        except Exception as e:
            logging.error(f"Generation failed: {e}")
            import traceback
            traceback.print_exc()
            with open(os.path.join(args.task_dir, "status.json"), "w") as f:
                 json.dump({"state": "error", "error": str(e)}, f)
            sys.exit(1)
    
    # Prepare for Genanki
    # Using a random ID for the model to avoid conflict
    model = genanki.Model(
        1607392319,
        Config.CARD_MODEL,
        fields=[
            {'name': 'Front'},
            {'name': 'Back'},
        ],
        templates=[
            {
                'name': 'Card 1',
                'qfmt': '{{Front}}',
                'afmt': '{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}',
            },
        ],
        css=""
    )
    
    notes = []
    media_files = []
    
    for word, card in cards_data.items():
        # card_formatter.get_front_html uses Config.ANKI_MEDIA_DIRECTORY implicitly in some way?
        # Checked code: it uses os.path.basename(card_data.image_path) for src.
        # But copy_to_media_directory uses Config.ANKI_MEDIA_DIRECTORY.
        # generate_cards logic saves images to processing_directory (task_dir).
        # We need to make sure we don't call copy_to_media_directory from standard logic if we can avoid it.
        # generate_cards.generate_text_and_image returns data but ALSO calls save_text etc.
        # It does NOT call anki import logic.
        # So we are good.
        
        front = card_formatter.get_front_html(card)
        back = card_formatter.get_back_html(card)
        
        note = genanki.Note(
            model=model,
            fields=[front, back],
            tags=[word.word.replace(' ', '_').lower(), "ai-generated"]
        )
        notes.append(note)
        
        if card.image_path and os.path.exists(card.image_path):
            media_files.append(card.image_path)
        if card.audio_path and os.path.exists(card.audio_path):
            media_files.append(card.audio_path)
            
    # Export
    output_file = os.path.join(args.task_dir, "deck.apkg")
    
    # In mock mode, we need to ensure media files are passed correctly and handle duplicates if using single mock image
    if args.mock:
         # genanki handles media files by copying them to a temp dir. Duplicates in list might be fine or wasteful.
         # Set only unique media files
         media_files = list(set(media_files))

    export_to_apkg(args.deck_name, notes, output_file, media_files)
    logging.info(f"Deck created at {output_file}")
    
    # Write success status
    with open(os.path.join(args.task_dir, "status.json"), "w") as f:
        json.dump({"state": "completed", "progress": 100}, f)

if __name__ == "__main__":
    main()
