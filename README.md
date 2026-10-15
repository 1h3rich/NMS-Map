# NMS Map

Aplicación móvil para registrar y explorar de forma comunitaria el universo de **No Man's Sky**: sistemas estelares y planetas, quién los descubrió, estadísticas, perfiles y un sistema social (amigos, clanes y chat).

Proyecto final de 2º de Desarrollo de Aplicaciones Multiplataforma (DAM).
Equipo: Ricardo Gómez Vela, Izan Mauleón Zaragoza y Luis Navarro Nocito. Tutor: Javier Castejón.
La propuesta original está en [`PropuestaInicial_NMS.pdf`](PropuestaInicial_NMS.pdf).

## Funcionalidades previstas

- Gestor de sistemas (CRUD) editable por la comunidad.
- Mapa 2D y, más adelante, 3D con modelos y texturas.
- Integración con APIs comunitarias de NMS y con la API propia.
- Login con correo y contraseña, 2FA y vinculación con Google.
- Chat interno (amigos, clanes y público).
- Estadísticas de jugador y globales.
- Buscador de descubrimientos, amigos y clanes.
- Perfil de usuario, configuración (colores, etc.) y notificaciones (en la app y por email).
- Panel de administración (logs, reportes, soporte, avisos).

Todo está sujeto a cambios.

## Stack

| Área | Tecnología |
| --- | --- |
| Lenguaje e interfaz | TypeScript + React Native |
| Desarrollo y builds | Expo (SDK 57), development builds para dependencias nativas |
| 3D (pendiente de prototipo) | Three.js + React Three Fiber |
| Persistencia local (alpha) | SQLite (alternativas: Realm, WatermelonDB) |
| Backend compartido | Por decidir (MySQL probablemente) |
| Equipo | Git + GitHub, Jira para el backlog y los sprints |

## Requisitos

- [Node.js](https://nodejs.org/) 20 LTS o superior (probado con Node 22) y npm.
- [Android Studio](https://developer.android.com/studio) con el SDK y un emulador, o un móvil Android con la app **Expo Go**.
- Opcional: VS Code como editor.

## Cómo ejecutarlo

```bash
git clone https://github.com/1h3rich/NMS-Map.git
cd NMS-Map
npm install
npm start          # arranca el servidor de desarrollo de Expo
```

Desde ahí:

- Pulsa `a` para abrirla en el emulador de Android (o ejecuta `npm run android`).
- Escanea el QR con **Expo Go** para abrirla en un móvil en la misma red.
- `npm run web` la abre en el navegador; `npm run ios` requiere macOS.

Cuando añadamos librerías con código nativo (por ejemplo React Three Fiber o SQLite), Expo Go ya no bastará y habrá que usar una development build:

```bash
npx expo run:android
```

## Comandos útiles

```bash
npx expo install <paquete>   # instala dependencias con versiones compatibles con el SDK
npx tsc --noEmit             # comprobación de tipos
npx expo-doctor              # diagnostica problemas de configuración y dependencias
```

## Estructura

```
App.tsx        Componente raíz de la app
index.ts       Punto de entrada (registra App)
app.json       Configuración de Expo (nombre, iconos, splash...)
assets/        Iconos e imágenes
AGENTS.md      Notas para asistentes de IA que trabajen en el repo
```

Las carpetas `android/` e `ios/` no se suben: Expo las genera a partir de `app.json`.

## Flujo de trabajo

No se hace push directo a `main`. Cada cambio va en una rama y se integra mediante pull request revisada por el equipo.
