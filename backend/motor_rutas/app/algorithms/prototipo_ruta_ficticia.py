import math
import time
from typing import Dict, List, Tuple

import numpy as np
from ortools.constraint_solver import pywrapcp, routing_enums_pb2


# -----------------------------------------------------------------------------
# Utilidades geográficas
# -----------------------------------------------------------------------------

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia en kilómetros entre dos puntos geográficos.

    Usa la fórmula de Haversine con radio terrestre promedio de 6371 km.
    """
    rad = math.pi / 180.0
    lat1_r, lon1_r = lat1 * rad, lon1 * rad
    lat2_r, lon2_r = lat2 * rad, lon2 * rad

    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return 6371.0 * c


# -----------------------------------------------------------------------------
# Datos ficticios del prototipo
# -----------------------------------------------------------------------------

def crear_coordenadas() -> Dict[str, Tuple[float, float]]:
    """Define las coordenadas ficticias del origen y los supermercados."""
    return {
        "Casa": (-33.0, -71.6),
        "Jumbo": (-33.02, -71.55),
        "Lider": (-33.04, -71.65),
        "Santa Isabel": (-33.01, -71.58),
        "Tottus": (-33.05, -71.60),
    }


def calcular_matriz_distancias(
    coordenadas: Dict[str, Tuple[float, float]],
) -> Tuple[np.ndarray, List[str]]:
    """Construye una matriz cuadrada de distancias en kilómetros usando Haversine."""
    nombres = list(coordenadas.keys())
    n = len(nombres)
    matriz = np.zeros((n, n), dtype=float)

    for i in range(n):
        for j in range(n):
            if i == j:
                matriz[i, j] = 0.0
                continue

            lat1, lon1 = coordenadas[nombres[i]]
            lat2, lon2 = coordenadas[nombres[j]]
            matriz[i, j] = haversine(lat1, lon1, lat2, lon2)

    return matriz, nombres


# -----------------------------------------------------------------------------
# Resolución del TSP con OR-Tools
# -----------------------------------------------------------------------------

def resolver_tsp(matriz_distancias: np.ndarray) -> Tuple[List[int], float, float]:
    """Resuelve el TSP con OR-Tools y devuelve el orden óptimo y el tiempo usado.

    Devuelve:
      - orden: lista de índices del recorrido óptimo
      - distancia_total: coste total del recorrido
      - tiempo_ejecucion: tiempo en segundos
    """
    n = matriz_distancias.shape[0]

    if n < 2:
        return [0], 0.0, 0.0

    # OR-Tools espera pesos enteros o flotantes convertidos a int64.
    # Para mantener precisión y evitar problemas de escala, multiplicamos por 1000.
    # Luego el costo se vuelve "distancia en metros" equivalente para la resolución.
    escala = 1000.0
    distancia_int = np.round(matriz_distancias * escala).astype(int)

    # Creación del manager y el solver
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def costo_arco(i: int, j: int) -> int:
        """Costo entre dos nodos del grafo."""
        idx_i = manager.IndexToNode(i)
        idx_j = manager.IndexToNode(j)
        return int(distancia_int[idx_i, idx_j])

    transit_callback_index = routing.RegisterTransitCallback(costo_arco)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Estrategia de solución inicial y búsqueda local
    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    params.time_limit.seconds = 2

    # Resolver
    inicio = time.perf_counter()
    solucion = routing.SolveWithParameters(params)
    tiempo_total = time.perf_counter() - inicio

    if solucion is None:
        raise RuntimeError("OR-Tools no pudo encontrar una solución válida para el TSP.")

    # OR-Tools 9.x usa RoutingModel.Start(vehicle_id) y End(vehicle_id), no StartIndex().
    # El recorrido se reconstruye desde el nodo inicial hasta que se alcanza el final del vehículo.
    nodo_actual = routing.Start(0)
    orden: List[int] = []

    while not routing.IsEnd(nodo_actual):
        indice_real = manager.IndexToNode(nodo_actual)
        orden.append(indice_real)
        nodo_actual = solucion.Value(routing.NextVar(nodo_actual))

    # Si el cálculo incluye el nodo final, lo agregamos solo si no estaba ya presente.
    if orden and orden[0] != 0:
        orden.insert(0, 0)

    # El recorrido debe cerrar el ciclo regresando al origen.
    if orden and orden[-1] != 0:
        orden.append(0)

    distancia_total = 0.0
    for i in range(len(orden) - 1):
        a = orden[i]
        b = orden[i + 1]
        distancia_total += matriz_distancias[a, b]

    return orden, distancia_total, tiempo_total


# -----------------------------------------------------------------------------
# Formateo de salida
# -----------------------------------------------------------------------------

def mostrar_resultados(
    orden: List[int], nombres: List[str], matriz_distancias: np.ndarray
) -> None:
    """Imprime la matriz de distancias y el recorrido final en formato legible."""
    print("\n=== Matriz de distancias (km) ===")
    print(" " * 12, end="")
    for nombre in nombres:
        print(f"{nombre:>12}", end="")
    print()

    for i, nombre_i in enumerate(nombres):
        print(f"{nombre_i:>12}", end="")
        for j in range(len(nombres)):
            print(f"{matriz_distancias[i, j]:>12.2f}", end="")
        print()

    print("\n=== Orden óptimo de visita ===")
    secuencia = [nombres[i] for i in orden]
    ruta = " → ".join(secuencia)
    print(ruta)

    distancia_total = 0.0
    for i in range(len(orden) - 1):
        distancia_total += matriz_distancias[orden[i], orden[i + 1]]
    print(f"\nDistancia total recorrida: {distancia_total:.2f} km")


# -----------------------------------------------------------------------------
# Flujo principal del prototipo
# -----------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("PROTOTIPO DE RUTA ÓPTIMA - DATOS FICTICIOS")
    print("=" * 60)

    coordenadas = crear_coordenadas()
    matriz_distancias, nombres = calcular_matriz_distancias(coordenadas)

    print("\nCoordenadas ficticias:")
    for nombre, (lat, lon) in coordenadas.items():
        print(f"- {nombre}: ({lat}, {lon})")

    inicio = time.perf_counter()
    try:
        orden, distancia_total, tiempo_ejecucion = resolver_tsp(matriz_distancias)
    except RuntimeError as exc:
        print(f"\nNo se pudo resolver el TSP: {exc}")
        return
    finally:
        tiempo_total = time.perf_counter() - inicio

    print(f"\nTiempo total de ejecución del solucionador: {tiempo_total:.4f} s")

    secuencia = [nombres[i] for i in orden]
    print("\n=== Ruta óptima encontrada ===")
    print(" → ".join(secuencia))
    print(f"Distancia total recorrida: {distancia_total:.2f} km")

    # Mostrar resultados completos
  #  mostrar_resultados(orden, nombres, matriz_distancias)


if __name__ == "__main__":
    main()
