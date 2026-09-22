from __future__ import annotations

import subprocess


class ScrapyCommandExecutor:
    """Ejecuta el spider real sin persistir el resultado en un archivo."""

    def __init__(self, command_runner=subprocess.run, spider_name="jumbo_rsc"):
        self.command_runner = command_runner
        self.spider_name = spider_name

    def __call__(self, _job):
        command = ["scrapy", "crawl", self.spider_name]
        completed = self.command_runner(
            command,
            capture_output=True,
            text=True,
            check=False,
        )
        if completed.returncode != 0:
            error = completed.stderr.strip() or "Scrapy terminó con error"
            raise RuntimeError(error)
        return {
            "status": "completed",
            "stdout": completed.stdout,
        }


def main():
    result = ScrapyCommandExecutor()({})
    print(result["stdout"], end="")


if __name__ == "__main__":
    main()