from app.core.strategy import RoutingStrategy
from typing import List, Dict, Any, Tuple
import httpx
# import ortools (Google OR-Tools para TSP) - Se implementará a fondo cuando la API reciba datos reales

class OSRMOrToolsStrategy(RoutingStrategy):
    """
    Estrategia definitiva basada en la investigación:
    - OSRM (Docker): Genera la matriz de distancias súper rápido en C++.
    - OR-Tools (Google): Toma la matriz y resuelve el TSP (Travelling Salesman Problem) 
      para encontrar en qué orden visitar los supermercados.
    """
    
    def __init__(self, osrm_base_url: str = "http://osrm-backend:5000"):
        # Apuntamos por defecto al contenedor interno de OSRM en nuestra red Docker
        self.osrm_url = osrm_base_url

    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        # Para Punto A a Punto B, OSRM lo resuelve nativamente sin necesidad de OR-Tools.
        # Recordar que OSRM usa formato {longitud},{latitud}
        return {
            "algorithm": "OSRM Directo",
            "status": "pending_implementation",
            "message": "Falta realizar la petición GET asíncrona vian httpx al contenedor osrm-backend."
        }

    def optimize_route(self, origin: Tuple[float, float], waypoints: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        El flujo arquitectónico para cuando se programe:
        1. Armar string con origen + todos los waypoints.
        2. GET a {self.osrm_url}/table/v1/driving/... para obtener la matriz NxN de distancias.
        3. Pasar la matriz a Google OR-Tools.
        4. OR-Tools devuelve el índice ordenado (ej: 0 -> 3 -> 1 -> 2 -> 0).
        5. Construir respuesta.
        """
        return {
            "algorithm": "OSRM + Google OR-Tools TSP",
            "status": "pending_implementation",
            "message": "Falta construir la llamada a /table/ y pasar el resultado a ortools.routing"
        }
