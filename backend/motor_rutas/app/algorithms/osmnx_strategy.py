from app.core.strategy import RoutingStrategy
from typing import Dict, Any, Tuple

class OSMnxStrategy(RoutingStrategy):
    """
    Estrategia puramente algorítmica: Descarga el grafo de la ciudad y 
    resuelve la ruta utilizando grafos matemáticos (NetworkX).
    """
    
    def __init__(self):
        # NOTA PARA EL DESARROLLADOR:
        # Aquí cargarías el grafo de la ciudad en memoria una sola vez al encender el servicio.
        # ej: self.graph = ox.graph_from_place("Ciudad, País", network_type="drive")
        pass

    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        # Simulacro de la lógica esperada:
        # 1. nearest_origin = ox.distance.nearest_nodes(self.graph, origin[1], origin[0])
        # 2. nearest_dest = ox.distance.nearest_nodes(self.graph, destination[1], destination[0])
        # 3. route = nx.shortest_path(self.graph, nearest_origin, nearest_dest, weight='length')
        
        return {
            "algorithm": "OSMnx (NetworkX Pure Math)",
            "status": "pending_implementation",
            "message": "Falta inicializar el grafo con ox.graph_from_place"
        }

class OSRMApiStrategy(RoutingStrategy):
    """
    Estrategia de API Externa: Delega el cálculo del camino más corto a 
    Open Source Routing Machine. Muy eficiente en memoria.
    """
    
    def calculate_route(self, origin: Tuple[float, float], destination: Tuple[float, float]) -> Dict[str, Any]:
        # Simulacro de la lógica esperada:
        # url = f"http://router.project-osrm.org/route/v1/driving/{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
        # response = requests.get(url).json()
        
        return {
            "algorithm": "OSRM External API",
            "status": "pending_implementation",
            "message": "Falta realizar la petición GET (requests)"
        }
