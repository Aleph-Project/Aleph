# Proyecto Grupo 1F - Prototipo 3
_**Integrantes:**_
* Angel David Piñeros Sierra (apineross@unal.edu.co)
* Catalina Gómez Moreno (catgomez@unal.edu.co) _Arquitecto líder_
* Gerardo Andrés Hormiga González (gahormigag@unal.edu.co)
* Ivana Alejandra Pedraza Hernández (ipedrazah@unal.edu.co)
* Juan Esteban Hunter Malaver (jhunter@unal.edu.co)
* Kelly Johana Solano Calderón (ksolanoc@unal.edu.co)

_**Grupo:**_ 1F

_*Profesor Jeisson Andrés Vergara Vargas*_

_*Arquitectura de Software*_

![Archivo:Logotipo de la Universidad Nacional de Colombia.svg - Wikipedia, la  enciclopedia libre](https://upload.wikimedia.org/wikipedia/commons/0/0a/Logotipo_de_la_Universidad_Nacional_de_Colombia.svg)

**Universidad Nacional de Colombia**  
**Facultad de Ingeniería**  
**Departamento de Ingeniería de Sistemas y Computación**
**2025-I**  

## Software System
 - **Name:** Aleph.
 - **Logo:** ![project/prototype_1/1F/Logo - Aleph.png](./Logo%20-%20Aleph.png)
 - **Description:** Aleph es un sistema de software de música, creado para que los usuarios puedan explorar, buscar y escuchar música, artistas y álbumes dentro de una sola plataforma. Los usuarios podrán buscar canciones, artistas y álbumes de su preferencia, estándo en la capacidad de utilizar filtros para sus búsquedas en base a las categorías musicales. Seleccionar las canciones de su interés para reproducirlas e interactuar con el reproductor para así poder realizar acciones como subir o bajar el volumen, pausar, acelerar y entre otras acciones con las cuales podrán disfrutar de sus canciones. Además de poder crear listas de reproducción en base a sus gustos músicales. Aleph se caracteriza por ser un sistema donde los usuarios puedan escribir y dejar sus opiniones o comentarios tanto en canciones como en álbumes, convirtiendo a Aleph en un espacio para el intercambio de opiniones y gustos músicales.

## 2. Architectural Structures Component-and Connector (C&C) Structure
## 2.1 C&C View (LucidChart)

A continuación se presenta el diagrama de componentes y conectores del sistema Aleph, donde se visualizan los principales elementos arquitectónicos y sus relaciones:

![Diagrama de Componentes y Conectores](./Componentes_Conectores.png)

## 2.2 Description of architectural styles and patterns used

### Architectural Styles

**Estilo de microservicios:** El sistema Aleph está diseñado siguiendo el estilo arquitectónico de microservicios, donde cada funcionalidad del sistema se implementa como un servicio independiente y autónomo. Esta arquitectura permite el desarrollo, despliegue y escalado independiente de cada componente del sistema.

| Patrón  | Descripción |
| ------------- |:-------------:|
| API Gateway     | Se implementa un patrón de puerta de enlace (API Gateway) a través del componente  ```aleph_ag ```, el cual actúa como punto único de entrada para el sistema. Este componente orquesta las llamadas entre frontend y microservicios, permitiendo abstraer la complejidad de la arquitectura distribuida. También es capaz de componer respuestas cuando es necesario interactuar con múltiples microservicios.     |
| Arquitectura Basada en Eventos (EDA)      | El sistema utiliza Apache Kafka como tecnología de mensajería para implementar una arquitectura orientada a eventos. Cada vez que un usuario reproduce una canción, se genera un evento song-played que se publica en un topic de Kafka. Este evento es consumido por el componente  ```aleph_queue_consumer```, el cual enriquece los datos consultando otros microservicios y almacena la información en la base de datos analítica ( ```aleph_analysis_db ```). Esto permite una comunicación asincrónica, desacoplada y escalable.    |

## 2.3 Description of architectural elements and relations

### Elements

| Patrón | Tier | Descripción |
|---|---|---|
| ```aleph_wfe (Web Frontend)``` | Presentación | Componente de presentación del sistema desarrollado con Next.js y Tailwind CSS. Permite la navegación, autenticación y gestión de usuarios, así como la visualización de canciones, reseñas y estadísticas desde el navegador. |
| ```aleph_dfe (Desktop Frontend)``` | Presentación | Aplicación de escritorio construida con Electron y Next.js. Reutiliza el frontend web, pero empacado como ejecutable independiente. Permite autenticación (correo o Google), registro, recuperación y cambio de contraseña, validación mediante códigos enviados por correo, todo integrado con Auth0. |
|```aleph_ag (API Gateway)```|Comunicación|Orquestador central que permite que los componentes de frontend se comuniquen con los distintos microservicios. Gestiona la recepción de peticiones HTTP (GET, POST, PATCH, DELETE), enruta hacia los microservicios apropiados y compone respuestas cuando se requiere información de múltiples fuentes.|
|```aleph_profile_ms```|Lógica|Microservicio encargado de gestionar la información de perfiles de usuarios, como datos personales, entre ellos su país de origen. Se apoya en una base de datos (aleph_profile_db).|
|```aleph_music_ms```|Lógica|Administra la información de artistas, canciones, álbumes y listas de reproducción personalizadas. Implementa búsqueda por filtros y visualización detallada. Utiliza ```aleph_music_db```, una base de datos MongoDB alojada en Atlas, para manejar datos flexibles (como letras, portadas, categorías).|
|```aleph_reviews_ms```|Lógica|Microservicio encargado de la gestión de reseñas para canciones y álbumes, tomando en cuenta la reseña principal, el voto realizado y los hilos de comentarios qué otros usuarios le realicen a la reseña. Este componente gestionará las operaciones de CREATE para la creación de reseñas, UPDATE para la actualización de reseñas, GET para la visualización de reseñas y DELETE para su eliminación, qué serán realizadas hacia la base de datos (```aleph_reviews_db```).|
|```aleph_auth_ms```|Lógica|	Servicio interno para autenticación, construido con Node.js, Express y TypeScript. Expone endpoints REST para registro, login, recuperación y cambio de contraseña. Utiliza JWT, correo de confirmación y se comunica con aleph_auth_db (MongoDB). Su implementación elimina la dependencia de Auth0 en entornos internos.|
|```aleph_analysis_ms```|Lógica|Microservicio de analítica que expone endpoints para obtener estadísticas como canciones más reproducidas y análisis por ubicación. Consulta directamente aleph_analysis_db, una base PostgreSQL con modelo estrella.|
|```aleph_message_queue```|Comunicación|Sistema de mensajería implementado con Apache Kafka. Recolecta eventos como song-played generados por acciones del usuario, y permite su consumo por otros servicios para análisis posterior.|
|```aleph_queue_consumer```|Lógica|	Consumer suscrito al topic de Kafka. Procesa eventos de reproducción de canciones, consulta datos a otros microservicios, enriquece la información y la almacena en ```aleph_analysis_db``` siguiendo el modelo estrella.|
|```aleph_music_db```|Data|Base de datos del microservicio de canciones, se encarga de manejar datos de las canciones, artistas y álbumes dentro del sistema (nombre del artista, duración de la canción, nombre del álbum, nombre de la canción, letra de las canciones, categorías y filtros, etc.). Para esto se optó por una base de datos MongoDB, debido a que es una base de datos flexible y escalable, permitiendo el constante crecimiento de la base de datos para las canciones, siendo la base de datos más grande para nuestro sistema. Adicionalmente, está en la capacidad de manejar documentos con estructuras variables, los cuales están incorporados en este servicio ya que los datos de las canciones manejan las portadas, letras, categorías, etc. |
|```aleph_reviews_db```|Data|Base de datos principal del microservicio de reseñas, encargada de la persistencia de las reseñas, qué incluye las reseñas (título, cuerpo, rating, fechas de creación y actualización, …), las réplicas (comentarios realizados dentro de las reseñas, representados en forma de hilos), y los votos (positivos o negativos). Es una base de datos relacional PostgreSQL.||```aleph_profile_db```|Data|Base de datos principal del ```aleph_profile_ms```, encargada de almacenar información estructurada de usuarios (nombre, biografía, fecha de cumpleaños, etc.). Será una base de datos PostgreSQL.|
|```aleph_profile_bk```|Data|Almacenamiento de objetos en Amazon S3 (Simple Storage Service) diseñado para guardar archivos asociados a perfiles de usuarios, como imágenes de avatar y portadas.|
|```aleph_auth (Componente externo SaaS)```|---|Auth0 se utilizó en el sistema de Aleph como proveedor externo de identidad utilizado para la gestión centralizada de autenticación de usuarios. Este componente permite a los usuarios iniciar sesión en el sistema de forma segura mediante diferentes métodos de autenticación (correo y contraseña, o cuenta de google). Auth0 se encarga del flujo completo de autenticación, generación de tokens (ID Token y Access Token en formato JWT) y manejo seguro de sesiones. Una vez autenticado, el usuario recibe un Access Token que es utilizado para autorizar solicitudes hacia los microservicios internos del sistema (cómo Profile, Songs o Review). Auth0 también proporciona endpoints para registro, recuperación de contraseñas, y validación de sesiones activas.|
|```aleph_auth_db```|Data|Base de datos MongoDB, alojada en MongoDB Atlas (en un clúster de AWS), utilizada por el microservicio de autenticación para el almacenamiento y recuperación eficiente de usuarios. Su estructura flexible permite adaptarse fácilmente a cambios futuros en el modelo de autenticación, como la integración de nuevos métodos (ej. biometría o redes sociales).|
|```aleph_music_bk```|Data|Para guardar archivos multimedia, incluyendo archivos de audio. Proporciona almacenamiento escalable y de alta disponibilidad para el contenido multimedia, facilitando el acceso rápido desde el microservicio de música y el sistema de streaming para la reproducción en tiempo real.|
|```aleph_profile_db```|Data|Base de datos principal del ```aleph_profile_ms```, encargada de almacenar información estructurada de usuarios (nombre, biografía, fecha de cumpleaños, etc.). Será una base de datos PostgreSQL.|
|```aleph_analysis_db```|Data|Base de datos de análisis para consultas multidimensionales. Implementa un modelo en estrella con una tabla de hechos principal (FactTableSongPlayed) y dimensiones como DimUser, DimSong, DimArtist, DimAlbum, DimLocation y DimTime. Su objetivo es permitir análisis rápidos sobre el comportamiento de reproducción dentro de Aleph.|

### Relations
| Fuente  | Destino | 	Tipo de Conexión| Descripción|
|----------|----------|----------| ----------|
| ```aleph_wfe```   | ```aleph_ag```   |REST|Peticiones HTTP para acceder a funcionalidades.|
| ```aleph_dfe```   | ```aleph_ag```   |REST|---|
| ```aleph_ag```   | ```aleph_profile_ms```   |REST|Manejo de perfiles.
| ```aleph_ag```   | ```aleph_music_ms```  |REST|Consulta y gestión de catálogos musicales.|
| ```aleph_ag```   | ```aleph_reviews_ms```   |REST|CRUD de reseñas y votos.|
| ```aleph_profile_ms```   | ```aleph_profile_db```   |TCP|PostgreSQL con datos estructurados de usuario.|
| ```aleph_music_ms```   | ```aleph_music_db```   |TCP|MongoDB flexible para metadatos musicales.|
| ```aleph_reviews_ms```   | ```aleph_reviews_db```   |TCP|PostgreSQL para persistencia de reseñas.|
| ```aleph_profile_ms```   | ```aleph_profile_bk```   |S3|Almacenamiento de archivos de usuario.|
| ```aleph_wfe```   | ```aleph_auth (SaaS)```   |SDK Auth0 (Next.js)|El frontend web usa la librería oficial de Auth0 para autenticación segura con redirección y manejo de sesión.|
| ```aleph_dfe```   | ```aleph_auth (SaaS)```   |SDK Auth0 (Next.js)|El desktop usa el SDK nativo de Auth0 para Electron, autenticando y almacenando tokens en el sistema operativo.|
| ```aleph_ag```   | ```aleph_message_queue```   |Kafka|Publicación de eventos song-played.|
| ```aleph_message_queue```   | ```aleph_queue_consumer```   |Kafka|Consumo de eventos.|
| ```aleph_queue_consumer```   | ```aleph_analysis_db```   |REST|Inserción e una base de datos PostgreSQL estructurada bajo modelo estrella.|
| ```aleph_analysis_ms```   | ```aleph_analysis_db```   |REST|Lectura para generación de reportes.|
| ```aleph_ag```   | ```aleph_auth_ms```   |REST|El API Gateway permite el acceso a los endpoints de autenticación desde los frontends.|
| ```aleph_ag```   | ```aleph_streaming_ms```   |REST|Se usa AUTH_MONGO_URI para conectar de forma segura con la base de datos del servicio de autenticación.|
| ```aleph_wfe```   | ```aleph_streaming_ms```   |REST|--|
| ```aleph_music_ms```   | ```aleph_music_bk```   |REST|Archivos de audio.|

## 3. Layered Structure
|Capa| Componentes|
|----|-------|
|Presentación|```aleph_wfe```, ```aleph_dfe```|
|Orquestación|```aleph_ag```, ```aleph_message_queue```|
|Lógica|```aleph_profile_ms```, ```aleph_music_ms```, ```aleph_reviews_ms```, ```aleph_analysis_ms```, ```aleph_queue_consumer```, ```aleph_auth_ms```|
|Datos|```aleph_profile_db```, ```aleph_music_db```, ```aleph_reviews_db```, ```aleph_analysis_db```, ```aleph_auth_db```, ```aleph_profile_bk```, ```aleph_music_bk```, ```aleph_streaming_bk```|


## 6. Quality Attributes (Security)
## 6.1. Secure Chanel Pattern

## 6.2 Reverse Proxy Pattern
## 6.3 Network Segmentation Pattern
### Scenario:
| Elemento         | Descripción del Comportamiento del Sistema                                                                                                                                    |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Source**       | Un atacante o servicio no autorizado ubicado en la red `public_net` intenta acceder directamente a un microservicio interno ubicado en la red `private_net`.         |
| **Stimulus**     | El atacante realiza una petición HTTP o un intento de conexión TCP/UDP desde una red externa hacia un microservicio o componente privado (ej. `aleph_ag`).                              |
| **Environment**  | El sistema de red Docker con redes segmentadas como: `public_net`, `private_net`, `ms_net`. |
| **Artifact**     | Microservicios internos (como `aleph_ag`) que están definidos únicamente en `private_net`.                                   |
| **Response**     | **Bloqueo de conexión por aislamiento de red** El sistema bloqueará el intento de acceso, ya que Docker impide la comunicación entre contenedores que no compartan la misma red. Dado a este comportamiento, el atacante no podrá acceder al microservicio interno. |
| **Response Measure** | **Tasa de Éxito.** Se cálcula la tasa de éxito de acuerdo al número de intentos de conexión provinientes de redes no autorizadas, que fueron efectivamente bloqueadas por la segmentación de red. |

## 6.4 Tokens Pattern
### Scenario:
| Elemento             | Descripción del Comportamiento del Sistema                                                                                                                                                       |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Source**           | Un usuario no autenticado (Posible atacante) intenta acceder a un microservicio protegido (`auth-ms`, `profile-ms`, `music-ms`, etc.) mediante una solicitud HTTP. |
| **Stimulus**         | Solicitudes HTTP enviadas con Tokens JWT inválidos.                                                        |
| **Environment**      | Sistema de microservicios desplegado con Docker, donde todas las solicitudes pasan a través del API Gateway `aleph_ag`, el cual se encarga de validar los tokens.                          |
| **Artifact**         | El componente `aleph_ag`, siendo responsable de validar los tokens antes de reenviar la petición al microservicio correspondiente.                                |
| **Response**         | El API Gateway `aleph_ag` rechaza la solicitud si el token es inválido o ha expirado, bloqueando el acceso.         |
| **Response Measure** | **Cantidad de peticiones bloqueadas por autenticación fallida**, ya sea por tokens inválidos o que hayan expirado.                                          |
