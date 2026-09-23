from __future__ import annotations


class ScraperResultPublisher:
    """Entrega items a un adaptador externo, como el cliente de la API."""

    def __init__(self, sender):
        self.sender = sender

    def publish(self, item):
        try:
            response = self.sender(item)
            return {"status": "sent", "item": item, "response": response}
        except Exception as error:
            return {"status": "failed", "item": item, "error": str(error)}