import genanki
import os
import random

def export_to_apkg(deck_name: str, notes: list, output_file: str, media_files: list = None):
    """
    Export cards to an .apkg file using genanki.
    
    Args:
        deck_name: Name of the deck.
        notes: List of genanki.Note objects.
        output_file: Path to save the .apkg file.
        media_files: List of paths to media files (images, audio) to include.
    """
    # Generate a random deck ID (or stable if needed, but random is fine for new decks)
    deck_id = random.randrange(1 << 30, 1 << 31)
    deck = genanki.Deck(deck_id, deck_name)

    for note in notes:
        deck.add_note(note)

    package = genanki.Package(deck)
    if media_files:
        package.media_files = media_files

    package.write_to_file(output_file)
