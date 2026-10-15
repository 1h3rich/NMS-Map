# Prototipo: planeta 3D en el móvil

Prototipo mínimo e independiente para validar la parte de la propuesta que decía
*"Three.js y React Three Fiber [...] Pendiente de prototipo en dispositivo"*.
No forma parte de la app; sirve para decidir si el stack 3D aguanta en un teléfono real.

## Qué hace

- Renderiza un planeta texturizado con **Three.js + React Three Fiber (`@react-three/fiber/native`) sobre `expo-gl`**,
  con luz direccional, fondo de estrellas y rotación automática.
- Se puede **arrastrar con el dedo** para girarlo.
- Dos formas de texturizar, para comparar:
  - `image`: un PNG equirectangular de 1024×512 incluido en `assets/planet.png` (generado con `tools/make_texture.py`).
  - `lush` / `toxic` / `frozen`: textura **procedural** de 256×128 generada en JS a partir de una semilla y un bioma
    (así podría pintarse cada planeta descubierto sin guardar imágenes). Botón `new seed` para otra.
- Selector de detalle de la esfera (32, 64 o 128 segmentos).
- En pantalla: **FPS medios** y **cuánto tarda en generarse la textura procedural**.

## Cómo probarlo en un móvil

Funciona en **Expo Go** (no hace falta development build: `expo-gl`, `expo-asset` y `expo-file-system` vienen incluidos).
Requiere Expo Go para SDK 57.

```bash
cd prototypes/planet-3d
npm install
npx expo start
```

Escanear el QR con Expo Go (Android) o la cámara (iOS), con el móvil en la misma red Wi‑Fi
(si no, `npx expo start --tunnel`).

## Qué anotar al probarlo

| Prueba | Qué mirar |
| --- | --- |
| `image`, 64 seg | ¿Aparece el planeta con la textura bien orientada? FPS en reposo y arrastrando |
| `image`, 128 seg | ¿Bajan los FPS? |
| `lush`, `toxic`, `frozen` | Tiempo de generación en ms (en Hermes será bastante mayor que en un PC) |
| `new seed` varias veces | ¿La app se traba al regenerar? ¿Sube la memoria? |

Si los FPS se mantienen cerca de 60 en un móvil de gama media con 64 segmentos, el stack sirve para la vista de planeta.

## Estructura

- `App.tsx`: escena, gesto de arrastre, HUD y botones.
- `src/Scene.tsx`: planeta (imagen o procedural), estrellas y medidor de FPS.
- `src/proceduralTexture.ts`: ruido de valor 3D muestreado sobre la esfera (sin costura) y paletas por bioma.
- `tools/make_texture.py`: regenera `assets/planet.png` (numpy + Pillow).
