import subprocess
import sys
import logging
import os

class GenerationService:
    def __init__(self, task_dir, language, level, openai_key):
        self.task_dir = task_dir
        self.language = language
        self.level = level
        self.openai_key = openai_key

    async def process_task(self, task_id, deck_name, input_words, file_path=None):
        cmd = [
            sys.executable,
            "-m",
            "backend.worker",
            "--task-dir", self.task_dir,
            "--deck-name", deck_name,
            "--language", self.language,
            "--level", self.level,
            "--mock"
        ]
        
        logging.info(f"Starting worker for task {task_id}")
        env = os.environ.copy()
        env["PYTHONPATH"] = os.getcwd() # Make sure we can import 'generator'
        
        # Run process
        # Using run_in_executor or simple subprocess call since we are in async function
        # But Popen is blocking if we use communicate() directly without async wrapper.
        # Ideally we use asyncio.create_subprocess_exec
        
        # Simplified synchronous wait for now as BackgroundTasks run in thread pool
        process = subprocess.Popen(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            logging.error(f"Worker failed: {stderr.decode()}")
            with open(os.path.join(self.task_dir, "error.log"), "w") as f:
                f.write(stderr.decode())
        else:
            logging.info(f"Worker finished: {stdout.decode()}")
            # Check if apkg exists
            if not os.path.exists(os.path.join(self.task_dir, "deck.apkg")):
                logging.error("Worker finished but no APGK found")
                with open(os.path.join(self.task_dir, "error.log"), "w") as f:
                    f.write("Worker finished but no APGK found.\nSTDOUT:\n" + stdout.decode())
