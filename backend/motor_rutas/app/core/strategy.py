from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple

class RoutingStrategy(ABC):
    """
    Interfaz Base para el Patrón Estrategia.
    Dado que el proyecto está en un "limbo" investigativo, este patrón
    permite al desarrollador crear múltiples algoritmos (Dijkstra, OSRM API, etc)
    y probarlos intercambiándolos sin romper la aplicación.
    """
    
    @abstractmethod
    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        """
        Calcula la ruta óptima entre dos puntos geográficos.
        
        :param origin: Tupla (latitud, longitud)
        :param destination: Tupla (latitud, longitud)
        :return: Diccionario con los resultados (distancia, nodos, tiempo, etc).
        """
        pass
