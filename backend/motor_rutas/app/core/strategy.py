from abc import ABC, abstractmethod
from typing import List, Dict, Any, Tuple

class RoutingStrategy(ABC):
    """
    Interfaz Base para el Patrón Estrategia.
    Define las operaciones que cualquier motor algorítmico debe cumplir.
    """
    
    @abstractmethod
    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        """
        Calcula la ruta óptima entre dos puntos geográficos (Punto A -> Punto B).
        
        :param origin: Tupla (latitud, longitud)
        :param destination: Tupla (latitud, longitud)
        :return: Diccionario con los resultados (distancia, nodos, tiempo, etc).
        """
        pass

    @abstractmethod
    def optimize_route(self, origin: Tuple[float, float], waypoints: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Resuelve el Problema del Viajante (TSP).
        Calcula el orden óptimo para visitar múltiples puntos (supermercados) 
        y retornar al origen u otro destino final, minimizando la distancia o tiempo total.
        
        :param origin: Tupla (latitud, longitud) de partida.
        :param waypoints: Lista de Tuplas (latitud, longitud) a visitar.
        :return: Diccionario con la ruta ordenada y tiempos/distancias totales.
        """
        pass
