import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
ALGORITHMS_DIR = ROOT / "app" / "algorithms"
if str(ALGORITHMS_DIR) not in sys.path:
    sys.path.insert(0, str(ALGORITHMS_DIR))

import prototipo_ruta_ficticia as proto


def ejecutar_demo():
    print("=" * 60)
    print("PROTOTIPO DE RUTA ÓPTIMA - EJECUCIÓN DIRECTA")
    print("=" * 60)

    coordenadas = proto.crear_coordenadas()
    matriz, nombres = proto.calcular_matriz_distancias(coordenadas)

    print("\nCoordenadas ficticias:")
    for nombre, (lat, lon) in coordenadas.items():
        print(f"- {nombre}: ({lat}, {lon})")

    print("\n=== Matriz de distancias (km) ===")
    print(" " * 12, end="")
    for nombre in nombres:
        print(f"{nombre:>12}", end="")
    print()

    for i, nombre_i in enumerate(nombres):
        print(f"{nombre_i:>12}", end="")
        for j in range(len(nombres)):
            print(f"{matriz[i, j]:>12.2f}", end="")
        print()

    try:
        orden, distancia_total, tiempo = proto.resolver_tsp(matriz)
    except RuntimeError as exc:
        print(f"\nNo se pudo resolver el TSP: {exc}")
        return

    secuencia = [nombres[i] for i in orden]
    print("\n=== Orden óptimo de visita ===")
    print(" -> ".join(secuencia))
    print(f"\nDistancia total recorrida: {distancia_total:.2f} km")
    print(f"Tiempo de ejecución del solucionador: {tiempo:.4f} s")


if __name__ == "__main__":
    ejecutar_demo()
