# Secret Studio (`/ss`)

Este documento explica qué es la ruta privada `/ss`, cómo funciona, qué archivos toca, qué motores usa, qué decisiones se tomaron, y qué cosas conviene saber si otra persona o IA necesita continuar el trabajo.

## Resumen rápido

`/ss` es una ruta privada dentro del sitio de Robeanny para generar álbumes editoriales con IA a partir de fotos reales de referencia.

Objetivo:

- Crear álbumes de 6 u 8 fotos.
- Mantener identidad facial fuerte.
- Mantener el mismo look dentro de un álbum.
- Cambiar el concepto completo en el siguiente álbum.
- Permitir guardar, descargar o borrar imágenes.
- Mantener la ruta fuera de indexación.

Estado actual:

- La ruta existe y funciona.
- Tiene desbloqueo por código.
- Está fuera del flujo i18n.
- Tiene `noindex`, `nofollow` y reglas de `robots`.
- Usa Google y OpenAI.
- Google está pensado como motor principal.
- OpenAI está disponible, pero el usuario reportó que suele sentirse más fake y más lento.

## Qué hace `/ss`

La ruta `/ss` es una experiencia privada para crear sesiones de fotos artificiales de Robeanny con estas reglas:

- Se parte de referencias reales.
- Se intenta preservar identidad facial.
- Cada clic en `Generar nuevo álbum` crea un álbum completo.
- Dentro del álbum se mantiene continuidad de ropa, peinado, maquillaje y look.
- Entre álbumes se intenta evitar repetición de receta creativa.
- Las referencias y resultados viven en Cloudinary, y localmente solo se guarda metadata ligera.

## Flujo funcional

### 1. Desbloqueo

La ruta no está abierta públicamente. Se entra con un código especial.

API:

- `POST /api/ss/unlock`
- `POST /api/ss/logout`

Lógica:

- Si el código es correcto, se crea una cookie privada.
- Esa cookie permite acceder a `/ss`.

Archivo principal:

- `src/app/api/ss/unlock/route.ts`
- `src/app/api/ss/logout/route.ts`
- `src/lib/secret-studio.ts`

### 2. Referencias

El usuario puede:

- usar referencias base preconfiguradas
- subir referencias nuevas

Cuando hay uploads del usuario:

- esos uploads se priorizan por encima de las referencias fallback
- esto ayuda a anclar mejor el rostro real

Archivo:

- `src/lib/secret-studio-shared.ts`
- `src/app/ss/SecretStudioClient.tsx`
- `src/app/api/ss/generate/route.ts`

### 3. Generación del álbum

Cuando el usuario genera un álbum:

1. Se recolectan parámetros UI.
2. Se crea un `albumSeed`.
3. Se pasan recetas recientes para evitar repetir.
4. El backend arma una receta creativa.
5. Se generan 6 u 8 imágenes.
6. Se devuelve el álbum a la UI.

### 4. Cloudinary y guardado

Las referencias subidas por el usuario se mandan a Cloudinary.

Las imágenes generadas también se suben a Cloudinary antes de llegar a la UI.

En IndexedDB del navegador solo queda metadata ligera con URLs remotas, prompts y receta.

Archivo:

- `src/lib/secret-studio-db.ts`

## Arquitectura por archivos

### Ruta principal

- `src/app/ss/page.tsx`

Responsabilidades:

- renderiza la ruta `/ss`
- marca metadata privada
- valida cookie de acceso
- pasa props iniciales al cliente

### Cliente/UI

- `src/app/ss/SecretStudioClient.tsx`

Responsabilidades:

- unlock UI
- selector de motor
- selección de cantidad de fotos
- selección de aspect ratio
- selección de presets creativos
- selector `Google Premium / Google Economy`
- `Face Lock Strong`
- carga de referencias
- generación del álbum
- historial local de álbumes
- guardado y borrado
- colapso del prompt base (`Ver más` / `Ver menos`)
- persistencia de preferencias del usuario en `localStorage`

### Generación backend

- `src/app/api/ss/generate/route.ts`

Responsabilidades:

- valida acceso
- recibe parámetros de generación
- prioriza referencias subidas
- prepara imágenes de referencia
- decide motor
- genera receta creativa
- evita repetir recetas recientes
- arma prompts
- genera imágenes
- devuelve álbum completo

### Núcleo del sistema

- `src/lib/secret-studio.ts`

Responsabilidades:

- cookie/session secret
- validación de código
- proveedores disponibles
- tamaños OpenAI
- control de seguridad del prompting
- creación de prompt por toma
- continuidad del álbum
- firma de recetas (`recipeSignature`)

### Tipos compartidos y referencias base

- `src/lib/secret-studio-shared.ts`

Responsabilidades:

- tipos compartidos (`StudioProvider`, `StudioAspectRatio`, `GoogleQualityMode`)
- referencias fallback base

### Guardado local

- `src/lib/secret-studio-db.ts`

Responsabilidades:

- abrir IndexedDB
- listar fotos guardadas
- guardar metadata de la foto
- borrar foto

### Cloudinary

- `src/lib/secret-studio-cloudinary.ts`
- `src/app/api/ss/cloudinary-bootstrap/route.ts`

Responsabilidades:

- preparar el preset unsigned
- subir referencias del usuario
- subir resultados generados
- devolver URLs remotas para que la UI no cargue base64 gigantes

### Privacidad / SEO

- `src/middleware.ts`
- `src/app/robots.ts`

Responsabilidades:

- excluir `/ss` del flujo `next-intl`
- bloquear indexación
- bloquear rastreo en `robots`

## Motores de IA

## Google

Google es el camino principal actualmente, porque ha dado mejores resultados en identidad facial.

Hay dos modos:

### Google Premium

Objetivo:

- mejor calidad
- más consistencia
- más caro

Modelo por defecto actual:

- `gemini-3-pro-image-preview`

Variables opcionales:

- `GOOGLE_PREMIUM_IMAGE_MODEL`
- `GOOGLE_PREMIUM_IMAGE_SIZE`

### Google Economy

Objetivo:

- más barato
- más rápido
- peor calidad visual

Modelo por defecto actual:

- `gemini-2.5-flash-image`

Variables opcionales:

- `GOOGLE_ECONOMY_IMAGE_MODEL`
- `GOOGLE_ECONOMY_IMAGE_SIZE`
- `GOOGLE_IMAGE_MODEL`
- `GOOGLE_IMAGE_SIZE`

Importante:

- Se quitó el planner extra con Google para bajar costo.
- Eso significa que Google ya no hace una llamada adicional de texto antes de generar imágenes.

## OpenAI

OpenAI sigue integrado, pero hoy se considera secundario/experimental.

Razones:

- el usuario reportó que se siente más fake
- tarda más
- en Vercel llegó a provocar timeouts cuando generaba álbumes largos

Motor de imagen usado:

- `gpt-image-1.5`

Planner creativo de OpenAI:

- usa `Responses API`
- modelo actual por defecto: `gpt-5-pro`
- `reasoning.effort = "high"`

Variable opcional:

- `SS_OPENAI_PROMPT_MODEL`

Importante:

- Ese planner mejora la receta creativa.
- No cambia el hecho de que la imagen final la pinta el modelo de imagen.

## Anti repetición

Esto no es solo UI. Hay lógica real de variación.

Sistema actual:

- la UI manda un `albumSeed`
- la UI manda recetas recientes
- el backend manda recetas recientes al planner
- el backend firma la receta resultante con `recipeSignature`
- si la receta nueva coincide con firmas recientes, intenta otra variante

Archivos:

- `src/app/ss/SecretStudioClient.tsx`
- `src/app/api/ss/generate/route.ts`
- `src/lib/secret-studio.ts`

## Continuidad dentro del álbum

El sistema intenta mantener dentro del mismo álbum:

- misma ropa
- mismos accesorios
- mismo peinado
- mismo maquillaje
- mismo set
- mismo concepto general

Solo deberían variar:

- pose
- encuadre
- expresión
- crop

Esto se reforzó en el prompt builder.

## Face Lock Strong

Existe un modo llamado `Face Lock Strong`.

Objetivo:

- priorizar identidad facial
- mantener ojos café oscuro
- evitar cambios en estructura del rostro

Reglas principales:

- misma mujer real de las referencias
- no reinterpretar
- no cambiar proporciones faciales
- no cambiar forma de ojos
- ojos café oscuro

Archivo:

- `src/lib/secret-studio.ts`

## Referencias base actuales

Se dejaron como referencias fallback principales estas 3, porque el usuario dijo que ahí sale perfectamente su rostro:

- `https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101026/17_m0y8pz.webp`
- `https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101026/15_grfi8j.webp`
- `https://res.cloudinary.com/dbm7zxsxr/image/upload/v1774101025/14_kpcwtg.webp`

Además quedaron referencias fallback secundarias detrás de ellas.

Archivo:

- `src/lib/secret-studio-shared.ts`

## UX actual

La UX ya incluye:

- selección del motor
- selección `Google Premium / Google Economy`
- selección de tamaño del álbum
- selección de ratio
- `Face Lock Strong`
- subida de referencias
- historial de álbumes
- guardado local
- recordatorio de ajustes vía `localStorage`
- `Prompt base` colapsable con `Ver más`
- mensajes de error y nota del proveedor
- progreso visual básico durante generación

## Qué problemas se resolvieron

### 1. Ruta privada real

Se creó el acceso por código y cookie privada.

### 2. No indexación

Se bloqueó `/ss` en metadata y `robots`.

### 3. Espacio vertical raro en cards

Se corrigió el grid que estiraba las tarjetas demasiado hacia abajo.

### 4. Timeout de OpenAI

Antes las imágenes del álbum se generaban en serie.

Ahora:

- hay concurrencia controlada
- OpenAI va en paralelo limitado
- Google va en paralelo más conservador

Archivo:

- `src/app/api/ss/generate/route.ts`

### 5. Prompt base demasiado largo en pantalla

Ahora el bloque se colapsa y muestra `Ver más`.

## Qué limitaciones siguen existiendo

### 1. OpenAI no es el motor ideal aquí

Aunque se reforzó el planner:

- puede seguir viéndose menos real
- puede seguir siendo más lento

### 2. Google Premium cuesta más

Es el tradeoff calidad/costo.

### 3. No hay pipeline asíncrono de álbumes

Todo el álbum todavía se genera en una sola request.

Eso ya mejoró mucho con concurrencia, pero si en el futuro vuelve a pegar contra límites:

- convendría convertirlo a jobs
- o generar 4 imágenes por tanda

### 4. La continuidad del álbum es fuerte, pero no perfecta

La IA puede todavía:

- variar demasiado el cabello
- estilizar más de la cuenta
- suavizar o embellecer rostro

especialmente si las referencias no son consistentes.

## Variables de entorno importantes

### Acceso

- `SS_ACCESS_CODE`
- `SS_ACCESS_SESSION_SECRET`

### OpenAI

- `OPENAI_API_KEY`
- `SS_OPENAI_PROMPT_MODEL` opcional

### Google

- `VERTEX_AI_PROJECT_ID`
- `VERTEX_AI_LOCATION`
- `GOOGLE_CREDENTIALS_JSON`
- `VERTEX_GEMINI_MODEL` opcional
- `VERTEX_IMAGEN_MODEL` opcional

Nota:
- En Vercel, `GOOGLE_CREDENTIALS_JSON` debe contener el JSON completo de la cuenta de servicio en una sola variable de entorno.
- No hace falta subir `google-key.json` al repo.

## Qué hace la UI vs qué hace backend

### Lo que sí hace la UI

- recoger ajustes del usuario
- recordar ajustes
- mandar parámetros reales al backend
- mostrar resultados
- gestionar guardado local

### Lo que sí hace el backend

- construir prompts reales
- variar recetas
- bloquear repeticiones
- reforzar identidad facial
- preparar referencias
- llamar a Google / OpenAI
- devolver el álbum

Conclusión:

No es una UI vacía. La UI sí controla cosas reales, pero el peso fuerte está en backend.

## Si otra IA toma este proyecto

Prioridades recomendadas:

1. Mantener Google como camino principal.
2. Tratar OpenAI como experimental.
3. No romper privacidad de `/ss`.
4. No quitar `Face Lock Strong`.
5. No mover las referencias base sin revisar calidad facial.
6. Si se mejora UX, no eliminar el guardado local.
7. Si se mejora arquitectura, mover generación a jobs async.

## Mejoras futuras recomendadas

### UX

- presets creativos más concretos y menos “marketing”
- mejor progreso por foto real
- preview de costo estimado antes de generar
- botón de “repetir look con otra pose”

### Calidad

- ordenar referencias por `hero face / support / body`
- permitir seleccionar una foto principal como ancla facial
- detectar rostro automáticamente y clasificar referencias

### Arquitectura

- cola de trabajos
- persistencia opcional en servidor
- generación incremental del álbum

### Dirección creativa

- presets como:
  - `White seamless studio`
  - `Warm beige studio`
  - `Commercial denim`
  - `Beauty crop`
  - `Seated portrait campaign`

## Archivos clave

- `src/app/ss/page.tsx`
- `src/app/ss/SecretStudioClient.tsx`
- `src/app/api/ss/unlock/route.ts`
- `src/app/api/ss/logout/route.ts`
- `src/app/api/ss/generate/route.ts`
- `src/lib/secret-studio.ts`
- `src/lib/secret-studio-shared.ts`
- `src/lib/secret-studio-db.ts`
- `src/middleware.ts`
- `src/app/robots.ts`

## Nota final

La intención de `/ss` no es solo “generar fotos con IA”, sino crear una cabina privada de dirección editorial para Robeanny:

- rápida
- privada
- reusable
- con identidad relativamente consistente
- con sensación premium

Si alguien continúa este trabajo, el objetivo correcto no es agregar más sliders, sino mejorar:

- fidelidad facial
- continuidad del álbum
- costo por generación
- estabilidad del runtime
- experiencia premium real
