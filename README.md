# Proyecto Grupo 1F - Prototipo #2

***Integrantes:***
* Angel David Piñeros Sierra (apineross@unal.edu.co)
* Catalina Gómez Moreno (catgomez@unal.edu.co)
* Gerardo Andrés Hormiga González (gahormigag@unal.edu.co)
* Ivana Alejandra Pedraza Hernández (ipedrazah@unal.edu.co)
* Juan Esteban Hunter Malaver (jhunter@unal.edu.co)
* Kelly Johana Solano Calderón (ksolanoc@unal.edu.co)

***Grupo:*** 1F

***Profesor*** 
*Jeisson Andrés Vergara Vargas*
 
 ***Arquitectura de Software*** 
 
![Archivo:Logotipo de la Universidad Nacional de Colombia.svg - Wikipedia, la  enciclopedia libre](https://upload.wikimedia.org/wikipedia/commons/0/0a/Logotipo_de_la_Universidad_Nacional_de_Colombia.svg)

**Universidad Nacional de Colombia**  
**Facultad de Ingeniería**  
**Departamento de Ingeniería de Sistemas y Computación**
**2025-I**    


***
# 1. Software System

 - **Name:** Aleph.
 - **Logo:** ![project/prototype_1/1F/Logo - Aleph.png](./Logo%20-%20Aleph.png)
 - **Description:** Aleph es un sistema de software de música, creado para que los usuarios puedan explorar, buscar y escuchar música, artistas y álbumes dentro de una sola plataforma. Los usuarios podrán buscar canciones, artistas y álbumes de su preferencia, estándo en la capacidad de utilizar filtros para sus búsquedas en base a las categorías musicales. Seleccionar las canciones de su interés para reproducirlas e interactuar con el reproductor para así poder realizar acciones como subir o bajar el volumen, pausar, acelerar y entre otras acciones con las cuales podrán disfrutar de sus canciones. Además de poder crear listas de reproducción en base a sus gustos músicales. Aleph se caracteriza por ser un sistema donde los usuarios puedan escribir y dejar sus opiniones o comentarios tanto en canciones como en álbumes, convirtiendo a Aleph en un espacio para el intercambio de opiniones y gustos músicales.

***

# 2. Architectural Structures Component-and Connector (C&C) Structure

## 2.1 C&C View (LucidChart)

A continuación se presenta el diagrama de componentes y conectores del sistema Aleph, donde se visualizan los principales elementos arquitectónicos y sus relaciones:

![Diagrama de Componentes y Conectores](./Componentes_Conectores.png)

## 2.2 Description of architectural styles and patterns used

### Architectural Styles

**Estilo de microservicios:** El sistema Aleph está diseñado siguiendo el estilo arquitectónico de microservicios, donde cada funcionalidad del sistema se implementa como un servicio independiente y autónomo. Esta arquitectura permite el desarrollo, despliegue y escalado independiente de cada componente del sistema.

### Patterns Used

**Patrón de API-Gateway:** Se implementa un API Gateway que actúa como punto de entrada único para todas las solicitudes de los clientes, manejando la autenticación, autorización, enrutamiento y balanceo de carga hacia los diferentes microservicios.

**Arquitectura basada en eventos:** Se implementa este tipo de arquitectura utilizando Apache Kafka como un sistema de mensajes para el microservicio aleph_analysis_ms. 

**Patrón de arquitectura basada en eventos (EDA):** Se está aplicando el patrón arquitectura basada en eventos (EDA) utilizando la tecnología Apache Kafka; cada vez que un usuario reproduce una canción, su sistema genera un evento que se envía a un topic en Kafka, el cual es consumido por un proceso en Python llamado kafka-consumer, que a su vez transmite la información al microservicio analysis-ms para su almacenamiento y análisis, permitiendo que los distintos componentes del sistema funcionen de forma desacoplada y respondan de manera eficiente a los eventos generados.

## 2.3 Description of architectural elements and relations

### Elements

**aleph_wfe.** El componente de web frontend es el encargado de la interacción entre el usuario y el sistema. Se encarga de mostrar visualmente las funcionalidades y de facilitar la comunicación, navegación y exploración del usuario dentro de Aleph. Este componente se ha desarrollado por medio de Next.js como el framework principal para el desarrollo de las estructuras y que utilizó Tailwind CSS para la construcción de los diseños y estilos.

**aleph_ag.** El componente de Apigateway cumple el rol de orquestador central de comunicaciones dentro del sistema Aleph, funcionando como un punto único de entrada que gestiona y orquesta las llamadas entre el frontend y los distintos microservicios que componen la lógica del sistema. Su propósito principal es abstraer la complejidad interna de la arquitectura distribuida, permitiendo que el cliente interactúe con una única interfaz mientras el gateway se encarga de enrutar, consolidar y distribuir las solicitudes hacia los servicios correspondientes. Además, aleph_ag posibilita la composición de respuestas cuando una operación requiere información de múltiples microservicios.

**aleph_profile_ms.** Microservicio encargado de gestionar la información de perfiles de usuarios, como datos personales, entre ellos su país de origen. Se apoya en una base de datos (aleph_profile_db).

**aleph_music_ms.** Microservicio encargado de la gestión de datos de canciones, álbumes y artistas registrados dentro del servicio de Aleph. Aporta funcionalidades para facilitar la interacción entre el usuario y el sistema, como la creación, visualización y eliminación de listas personalizadas, las cuales estarán conformadas por canciones que sean del interés del usuario, quien podrá agregarlas o eliminarlas de dichas listas. Además, incluye búsqueda por filtros para encontrar canciones y artistas de la preferencia del usuario, como la visualización de la información a detalle de dichas canciones y/o artistas.

**aleph_reviews_ms.** Microservicio encargado de la gestión de reseñas para canciones y álbumes, tomando en cuenta la reseña principal, el voto realizado y los hilos de comentarios qué otros usuarios le realicen a la reseña. Este componente gestionará las operaciones de CREATE para la creación de reseñas, UPDATE para la actualización de reseñas, GET para la visualización de reseñas y DELETE para su eliminación, qué serán realizadas hacia la base de datos (aleph_reviews_db)

**aleph_profile_db.** Base de datos principal del aleph_profile_ms, encargada de almacenar información estructurada de usuarios (nombre, biografía, fecha de cumpleaños, etc.). Será una base de datos PostgreSQL.

**aleph_music_db.** Base de datos del microservicio de canciones, se encarga de manejar datos de las canciones, artistas y álbumes dentro del sistema (nombre del artista, duración de la canción, nombre del álbum, nombre de la canción, letra de las canciones, categorías y filtros, etc.). Para esto se optó por una base de datos MongoDB, debido a que es una base de datos flexible y escalable, permitiendo el constante crecimiento de la base de datos para las canciones, siendo la base de datos más grande para nuestro sistema. Adicionalmente, está en la capacidad de manejar documentos con estructuras variables, los cuales están incorporados en este servicio ya que los datos de las canciones manejan las portadas, letras, categorías, etc. 

**aleph_reviews_db.** Base de datos principal del microservicio de reseñas, encargada de la persistencia de las reseñas, qué incluye las reseñas (título, cuerpo, rating, fechas de creación y actualización, …), las réplicas (comentarios realizados dentro de las reseñas, representados en forma de hilos), y los votos (positivos o negativos). Es una base de datos relacional PostgreSQL.

**aleph_profile_bk.** Almacenamiento de objetos en Amazon S3 (Simple Storage Service) diseñado para guardar archivos asociados a perfiles de usuarios, como imágenes de avatar y portadas.

**aleph_auth (Componente externo SaaS).** Auth0 se utilizó en el sistema de Aleph como proveedor externo de identidad utilizado para la gestión centralizada de autenticación de usuarios. Este componente permite a los usuarios iniciar sesión en el sistema de forma segura mediante diferentes métodos de autenticación (correo y contraseña, o cuenta de google). Auth0 se encarga del flujo completo de autenticación, generación de tokens (ID Token y Access Token en formato JWT) y manejo seguro de sesiones. Una vez autenticado, el usuario recibe un Access Token que es utilizado para autorizar solicitudes hacia los microservicios internos del sistema (cómo Profile, Songs o Review). Auth0 también proporciona endpoints para registro, recuperación de contraseñas, y validación de sesiones activas.

**aleph_auth_ms.** Microservicio responsable del registro y gestión de autenticación de usuarios dentro del ecosistema Aleph. Fue desarrollado para eliminar la dependencia de servicios de terceros y centralizar la autenticación en una solución propia. Está construido con Node.js, usando el framework Express y el lenguaje TypeScript, lo que permite una fácil integración con las interfaces de NextAuth empleadas en los frontends (web y desktop). 
Provee endpoints REST para: 
- Registro de usuario 
- Inicio de sesión 
- Recuperación de contraseña 
- Cambio de contraseña
Además, implementa medidas de seguridad como generación de tokens JWT y envío de correos electrónicos de confirmación, con el fin de evitar el robo de identidad. Se comunica con los frontends a través de un API Gateway y se conecta con la base de datos MongoDB alojada en Atlas.

**aleph_auth_db.** Base de datos MongoDB, alojada en MongoDB Atlas (en un clúster de AWS), utilizada por el microservicio de autenticación para el almacenamiento y recuperación eficiente de usuarios. Su estructura flexible permite adaptarse fácilmente a cambios futuros en el modelo de autenticación, como la integración de nuevos métodos (ej. biometría o redes sociales).

**aleph_music_bk.** Para guardar archivos multimedia, incluyendo archivos de audio. Proporciona almacenamiento escalable y de alta disponibilidad para el contenido multimedia, facilitando el acceso rápido desde el microservicio de música y el sistema de streaming para la reproducción en tiempo real.

**aleph_message_queue.** Componente basado en Kafka, encargado de manejar la comunicación asincrónica mediante un sistema de publicación y suscripción. Se utiliza para la recolección de eventos de reproducción de canciones (song-played) que luego serán consumidos para análisis posteriores.

**aleph_queue_consumer.** Componente suscrito a los topics definidos en aleph_message_queue. Su función principal es consumir eventos como song-played, completándolos con información adicional consultando a otros microservicios (como aleph_music_ms y aleph_profile_ms a través de aleph_ag), y almacenar los datos resultantes en una base de datos de análisis con modelo estrella (aleph_analysis_db).

**aleph_analysis_ms.** Microservicio que consulta la base de datos aleph_analysis_db para exponer información estadística útil al usuario, como las canciones más reproducidas, análisis de comportamiento por ubicación, entre otros.

**aleph_analysis_db.** Base de datos de análisis para consultas multidimensionales. Implementa un modelo en estrella con una tabla de hechos principal (FactTableSongPlayed) y dimensiones como DimUser, DimSong, DimArtist, DimAlbum, DimLocation y DimTime. Su objetivo es permitir análisis rápidos sobre el comportamiento de reproducción dentro de Aleph.

**aleph_dfe:** El componente desktop frontend, está encargado de la interacción entre el usuario y el sistema. Ofrece la capacidad de ejecución en un ambiente más accesible al usuario, por medio de un programa ejecutable para escritorio. Este componente permite realizar las funcionalidades de inicio de sesión, con correo y contraseña, añadiendo el inicio de sesión por medio de una cuenta de Google. Así mismo, incluye las funcionalidades de registro de usuario, recuperación de contraseña y asignación de nueva contraseña, las cuales implementan una verificación de usuario por medio de un código de autenticación que será previamente enviado al correo del respectivo usuario que ha realizado su registro o su cambio de contraseña. Su implementación se realiza con el framework de creación de aplicaciones de escritorio Electron, integrado con Next.js para el desarrollo de las estructuras previamente realizadas en el componente web (aleph_wfe). Finalmente, se utiliza Tailwind CSS para la creación de estilos y diseños.

### Relaciones

**aleph_wfe ↔ aleph_ag:** Nuestra API Gateway se comunica con nuestro aleph_wfe por medio de REST como el conector principal de entre estos dos componentes. Realiza su conexión por medio de peticiones HTTP, como GET's o POST's. De manera que el frontend consume los endpoints que ofrece el API Gateway para así realizar las acciones que solicitan los usuarios al interactuar con el sistema y con ello, obtener respuesta de los diferentes microservicios a los cuales el API Gateway orquesta.

**aleph_ag ↔ aleph_profile_ms:** Nuestro API Gateway se comunica con el microservicio de perfiles con un conector de tipo REST, usando el protocolo HTTP. Se decide utilizar este tipo de conector dado a qué las operaciones implementadas necesitan del uso de operaciones HTTP convencionales (CREATE, POST, PATCH, DELETE, etc.) con su endpoint correspondiente. Las consultas realizadas deben retornar datos concretos o específicos, definidos dentro de cada funcionalidad.

**aleph_ag ↔ aleph_music_ms:** Nuestra API Gateway se comunica con el microservicio de canciones mediante un conector REST. Se decidió tomar REST puesto que nos proporciona herramientas para consultar datos de canciones, artistas, álbumes y listas de reproducción. De esta manera, los usuarios se encuentran en la capacidad de consultar de manera exacta los datos que necesitan. Promueve la modularidad en el sistema, teniendo endpoints bien definidos.

**aleph_ag ↔ aleph_reviews_ms:** El API Gateway se comunica con el microservicio de reviews por medio de un conector de tipo REST, bajo el protocolo HTTP. El uso de REST como conector, facilita la ejecución de operaciones HTTP como es la creación, actualización, visualización y eliminación de reseñas y réplicas. Dadas las funcionalidades del componente de reseñas, se requieren realizar operaciones sobre cada recurso utilizando diferentes endpoints para recuperar de forma persistente información específica.

**aleph_profile_ms ↔ aleph_profile_db:** El microservicio aleph_profile_ms, desarrollado en Ruby on Rails, se conecta directamente a su base de datos aleph_profile_db (PostgreSQL) para gestionar toda la información relacionada con los perfiles de usuario. Esto incluye operaciones como crear nuevos usuarios, actualizar información personal y recuperar datos de perfil cuando se navega por la plataforma. La lógica de negocio reside en el microservicio, mientras que la base de datos actúa como almacenamiento aislado de otros servicios. La conexión entre el microservicio y la base también se realiza a través de TCP.

**aleph_music_ms ↔ aleph_music_db:** Para la comunicación entre el microservicio y su base de datos se utilizaron cursores para la conexión. Los cuales se usaron como conectores para así ejecutar las operaciones sobre la base de datos. Esta comunicación se realizó bajo el protocolo TCP para poder garantizar una comunicación mutua y un transporte de datos confiable, ya que nos permite controlar el flujo de datos.

**aleph_reviews_ms ↔ aleph_reviews_db:** El microservicio aleph_reviews_ms, también hecho en Ruby on Rails, se comunica con su base de datos aleph_reviews_db para almacenar y gestionar las reseñas que los usuarios escriben sobre las canciones. La conexión entre el microservicio y la base también se realiza a través de TCP.

**aleph_profile_ms ↔ aleph_profile_bk:** El microservicio aleph_profile_ms se comunica con el bucket de almacenamiento aleph_profile_bk para gestionar los archivos multimedia relacionados con los perfiles de usuario, tales como imágenes de avatar y portadas.

**aleph_wfe ↔ aleph_auth (SaaS):** El conector entre el frontend (Next.js) y Auth0 se establece a través de la librería oficial de Auth0 para Next.js (@auth0/nextjs-auth0). Este conector se implementa directamente en la capa del frontend y facilita la integración del flujo de autenticación mediante rutas API y hooks React preconfigurados. Cuando un usuario accede al sitio, este conector redirige al usuario hacia el dominio de Auth0 para completar el login/logout de forma segura usando HTTPS. Una vez autenticado, Auth0 redirige nuevamente al frontend con un token de sesión, almacenado de forma segura mediante cookies HTTP-only. Este conector también permite obtener los datos del usuario autenticado y sus tokens mediante funciones del lado del servidor (getSession) o en el cliente (useUser).

**aleph_dfe ↔ aleph_ag:** El API Gateway se comunica con el componente desktop (aleph_dfe) por medio de un conector tipo REST. La conexión se hace por medio de peticiones HTTP (utilizando los verbos GET, CREATE, POST y DELETE). El usuario cuando realiza operaciones dentro del componente desktop, estas peticiones se realizan directamente hacia el API Gateway qué le permite consumir los endpoints qué tiene definidos. De esta forma el usuario obtiene los resultados esperados de los microservicios orquestados por el API Gateway.

**aleph_dfe ↔ aleph_auth (SaaS):** El conector entre el componente desktop (aleph_dfe) y Auth0 se implementa por medio del conector de Auth0 nativo, utilizando la librería Auth0 para Node.js. La elección de utilizar el SDK de bajo nivel es qué permite su uso en cualquier entorno de Node.js, como es el caso de Electron, donde su proceso principal funciona en este entorno. Así mismo, permite tener un control sobre el flujo de la autenticación (creación de cliente de autenticación, verificación de conectividad y DNS, apertura de ventana de autenticación para cargar login de Auth0, autenticación del usuario, captura de la respuesta callback, intercambio de tokens, almacenamiento seguros de tokens, por medio de la librería Keytar, y retorno de resultado a la aplicación desktop). Una vez el usuario se autentica, sus credenciales quedan almacenadas dentro del sistema de llaves del sistema operativo, siendo posible verificar la información de la sesión y el usuario.

**aleph_ag ↔ aleph_message_queue:** El API Gateway actúa como productor de eventos cuando ciertos eventos de usuario ocurren (por ejemplo, una canción es reproducida). Pública estos eventos en el topic correspondiente dentro de aleph_message_queue usando Kafka.

**aleph_message_queue ↔ aleph_queue_consumer:** La cola de mensajes aleph_message_queue entrega los eventos a aleph_queue_consumer mediante un conector Kafka. El queue_consumer permanece suscrito al topic song-played, del cual extrae los mensajes para su posterior procesamiento.

**aleph_queue_consumer ↔ aleph_analysis_db:** El queue_consumer almacena los datos procesados en aleph_analysis_db, una base de datos PostgreSQL estructurada bajo el modelo estrella.

**aleph_analysis_ms ↔ aleph_analysis_db:** El microservicio aleph_analysis_ms consulta directamente la base de datos aleph_analysis_db para generar reportes estadísticos.

**aleph_ag ↔ aleph_auth_ms:** El microservicio de autenticación se comunica con los frontends a través del API Gateway, utilizando el protocolo REST. Esto permite una integración clara, sencilla y estandarizada con ambas interfaces de usuario (web y desktop), facilitando el consumo de los endpoints expuestos por aleph_auth_ms.

**aleph_ag ↔ aleph_streaming_ms:** La conexión entre el microservicio de autenticación y la base de datos se realiza mediante una cadena de conexión segura definida en la variable de entorno AUTH_MONGO_URI. Esta conexión permite que el microservicio consulte y actualice la información de usuarios de forma eficiente, sin exponer directamente los detalles de la base de datos en el código fuente.

**aleph_wfe ↔ aleph_streaming_ms:** El frontend web (Aleph_wfe) no solo utiliza la autenticación propia del sistema, sino que también permite a los usuarios autenticarse mediante Google, a través de la integración con NextAuth. Esta biblioteca facilita la implementación de múltiples proveedores de autenticación, manteniendo una experiencia fluida y segura para el usuario.

***

# 3. Layered Structure

## 3.1 Layered View (LucidChart)

A continuación se presenta el diagrama de la estructura en capas del sistema Aleph, donde se visualizan las cuatro capas principales y la distribución de los componentes:

![Diagrama de Capas](./Capas.png)

## 3.2 Descripción de patrones arquitectónicos utilizados

Se cuenta con una separación de los componentes en 4 capas físicas, estas siendo:
- **Capa de presentación**
- **Capa de orquestación**
- **Capa de lógica**
- **Capa de data**

Esta estructura permite una clara separación de responsabilidades, facilitando el mantenimiento, escalabilidad y evolución del sistema.

## 3.3 Descripción de elementos arquitectónicos y relaciones

### Elementos

**Capa de presentación:**
- aleph_wfe
- aleph_dfe

**Capa de orquestación:**
- aleph_ag
- aleph_message_queue

**Capa de lógica:**
- aleph_profile_ms
- aleph_music_ms
- aleph_reviews_ms
- aleph_analysis_ms
- aleph_queue_consumer

**Capa de data:**
- aleph_profile_db
- aleph_profile_bk
- aleph_music_db
- aleph_music_bk
- aleph_reviews_db
- aleph_analysis_db

# 4. Deployment Structure

## 4.1 Deployment View (LucidChart)

A continuación se presenta el diagrama de despliegue del sistema Aleph, donde se visualizan los contenedores, servicios en la nube y la distribución de los componentes:

![Diagrama de Despliegue](./Despliegue.png)

## 4.2 Descripción de patrones arquitectónicos utilizados

El sistema Aleph se despliega en un entorno híbrido que combina contenedores Docker con servicios en la nube, distribuidos entre AWS y Azure. Esta arquitectura permite flexibilidad, escalabilidad y alta disponibilidad de los servicios.

## 4.3 Descripción de elementos arquitectónicos y relaciones

### Elementos

**Contenedores Docker:**
- aleph_profile_ms
- aleph_music_ms
- aleph_reviews_ms
- aleph_streaming_ms
- aleph_auth_ms
- aleph_analysis_ms
- aleph_queue_consumer
- aleph_ag
- aleph_message_queue
- aleph_wfe

Cada uno corre en un puerto específico (ver Deployment View).

**Despliegue del cliente de escritorio (aleph_dfe):**
Dada la naturaleza del segundo componente de presentación como una aplicación de escritorio independiente y ejecutable (aleph_dfe), no se encontró la necesidad de crear un contenedor para su respectiva ejecución. Esto se da, debido a que Electron es un framework que actúa como un contenedor de ejecución, para permitir la creación de ejecutables. Como resultado, el usuario está en la capacidad de ejecutar directamente el sistema por medio del ejecutable (.AppImage para Linux).

**Bases de datos (Azure Cloud & AWS):**
- aleph_profile_db (PostgreSQL)
- aleph_reviews_db (PostgreSQL)
- aleph_analysis_db (PostgreSQL para análisis)
- aleph_music_db (MongoDB, administrada en Atlas, en un cluster en AWS)
- aleph_auth_db (MongoDB, administrada en Atlas, en un cluster en AWS)

**Buckets (AWS Cloud):**
- aleph_profile_bk (S3 para imágenes de perfil)
- aleph_music_bk (S3 para archivos de audio)

***

# 5. Decomposition Structure

## 5.1 Decomposition View (LucidChart)

A continuación se presenta el diagrama de descomposición del sistema Aleph, donde se visualizan las funcionalidades principales y la distribución de los componentes involucrados:

![Diagrama de Descomposición](./Descomposición.png)

## 5.2 Descripción de elementos arquitectónicos y relaciones

La descomposición se realizó a través de las funcionalidades del sistema, que cumplen responsabilidades específicas. Cada funcionalidad se conforma de su componente de presentación, de comunicación, de lógica y finalmente de persistencia.

### Funcionalidades

**Profile functionalities:**
Módulo de perfil encargado de la gestión de la información de los usuarios dentro del sistema de Aleph. Este permite que los usuarios puedan crear su perfil incluyendo información de nombre de usuario, biografía y demás. Así mismo, permite la gestión de las reseñas asociadas al usuario. El usuario interactúa a través del componente de presentación (aleph_wfe), el cual a través del componente de comunicación (aleph_ag), solicita las operaciones registradas en el componente de lógica (aleph_profile_ms). Esto se comunicará con los componentes de persistencia (aleph_profile_db y aleph_profile_bk) para el almacenamiento de la información.

**Reviews functionalities:**
Módulo de reseñas encargado de la gestión de reseñas dadas por los usuarios hacia las canciones. Permite que los usuarios, cuando ingresan a la aplicación e ingresan a la vista de una canción, puedan crear una reseña con calificación y comentario. Así el usuario podrá realizar modificaciones a la reseña o eliminarlas. El usuario interactúa desde el componente de presentación (aleph_wfe), en la vista de una canción, realiza una operación hacia el componente de comunicación (aleph_ag), que redirecciona las peticiones al componente de lógica (aleph_reviews_ms). Como persistencia, el componente de lógica almacena y consulta la información desde el componente de persistencia (aleph_reviews_db).

**Analysis functionalities:**
Dicha funcionalidad se encarga de identificar los artistas más escuchados en la plataforma, la canción más popular a nivel nacional y el top 10 canciones más reproducidas. Para esto, el usuario se encarga de enviar una solicitud desde el componente de presentación aleph_wfe, el cual se comunica y se gestiona por medio del API Gateway (aleph_ag). La solicitud del usuario se publica en una cola de mensajes, denominada como aleph_message_queue. Se tiene un componente llamado aleph_queue_consumer que será el encargado de consumir los mensajes de la cola y enviarlos al microservicio de análisis, aleph_analysis_ms, el cual procesa los datos para así generar los resultados de análisis de las canciones. Finalmente, estos datos se guardan en la base de datos aleph_analysis_db, desde donde pueden ser consultados a futuro.

**Authentication functionalities:**
Se posee una funcionalidad para la autenticación de usuarios en Aleph. Esta funcionalidad permite que los usuarios puedan registrarse dentro de la plataforma con sus datos de autenticación e iniciar sesión respectivamente. Además, están en la capacidad de cambiar su contraseña en caso que esta haya sido olvidada. Para esta funcionalidad, se cuenta con dos componentes de presentación aleph_wfe (Componente Web) y aleph_dfe (Componente Desktop), para la interacción con el usuario. Ambas interfaces envían las solicitudes de autenticación de los usuarios al API Gateway (aleph_ag), comunicándose así con el microservicio de autenticación (aleph_auth_ms). Finalmente, dicho microservicio se comunica con la base de datos de autenticación (aleph_auth_db) para consultar y almacenar los datos de los usuarios previamente registrados.

**Music functionalities:**
Se tiene una funcionalidad para la presentación de metadata y reproducción de música, en donde el componente de presentación solicita por medio del api gateway a music_ms, información de artistas, álbumes y canciones a reproducir. Además, por medio de streaming-ms se sirve la canción a reproducir.

***

# Instrucciones para el despliegue local del sistema

1. **Verificar requisitos previos:**
   - Asegúrate de tener instalado Docker y Docker Compose en tu máquina.
   - (Opcional) Instala Git si aún no lo tienes.

2. **Clonación del repositorio:**
   - Clona el repositorio desde GitHub:
     ```bash
     git clone <https://github.com/unal-swarch/swarch2025i/tree/main/project/prototype_2/1F>
     ```

3. **Configurar variables de entorno:**
   - Dirígete a la ruta del proyecto:
     ```bash
     cd swarch2025i/project/prototype_1/1F
     ```
   - Crea o revisa los archivos `.env` necesarios para cada microservicio o para Docker Compose. Asegúrate de definir correctamente las variables de entorno requeridas (puertos, credenciales, claves, etc.).

4. **Construcción y despliegue de los contenedores:**
   - Ejecuta el siguiente comando para orquestar y crear los componentes:
     ```bash
     docker compose up --build
     ```

5. **Verificación del despliegue:**
   - Verifica que todos los contenedores estén corriendo correctamente:
     ```bash
     docker ps
     ```
   - Puedes revisar los logs de los servicios para asegurarte de que no haya errores:
     ```bash
     docker compose logs -f
     ```

6. **Acceso a la aplicación:**
   - Accede a la aplicación web desde tu navegador en la URL y puerto configurados (por ejemplo, `http://localhost:3000`).
   - Si tienes un cliente de escritorio entra a la carpeta README.md de aleph-frontend-dsk.

7. **(Opcional) Detener los servicios:**
   - Para detener todos los contenedores, ejecuta:
     ```bash
     docker compose down
     ```

***






