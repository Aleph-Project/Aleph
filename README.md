# Proyecto Grupo 1F - Prototipo #1

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
 - **Logo:** ![project/prototype_1/1F/Logo - Aleph.png](https://github.com/unal-swarch/swarch2025i/blob/6ea1e059172aa56221595de5dee4377fe59ca7fb/project/prototype_1/1F/Logo%20-%20Aleph.png)
 - **Description:** Aleph es un sistema de software de música, creado para que los usuarios puedan explorar, buscar y escuchar música, artistas y álbumes dentro de una sola plataforma. Los usuarios podrán buscar canciones, artistas y álbumes de su preferencia, estándo en la capacidad de utilizar filtros para sus búsquedas en base a las categorías musicales. Seleccionar las canciones de su interés para reproducirlas e interactuar con el reproductor para así poder realizar acciones como subir o bajar el volumen, pausar, acelerar y entre otras acciones con la cuales podrán disfrutar de sus canciones. Además de poder crear listas de reproducción en base a sus gustos músicales. Aleph se caracteriza por ser un sistema donde los usuarios puedan escribir y dejar sus opiniones o comentarios tanto en canciones como en álbumes, convirtiendo a Aleph en un espacio para el intercambio de opiniones y gustos músicales.

***
# 2. Architectural Structures 
## Component-and Connector (C&C) Structure
 - **C&C View:** ![project/prototype_1/1F/ARQUITECTURA_ALEPH_-_Pagina_1.png](https://github.com/unal-swarch/swarch2025i/blob/489c7653bbbc08ff5d157fa8518e6702a5915b0a/project/prototype_1/1F/ARQUITECTURA_ALEPH_-_Pagina_1.png)
 - **Description of architectural styles used:**
   - La arquitectura de Aleph, sigue un estilo arquitectónico de microservicios, junto con el patrón arquitectónico de Api Gateway central,  además cuenta con una separación de sus componentes en 4 capas físicas, estas siendo:
      -  *Capa de presentación:* Componente encargado de presentar las interfaces gráficas para la interacción del usuario con el sistema. Interactúa únicamente con el sistema a través del ApiGateway.
         - *Componente:* aleph_wfe  
      -  *Capa de orquestación/Comunicación:* API Gateway basado en *YARP* y *asp.net* que enruta solicitudes al microservicio correspondiente, y orquesta con una capa de lógica extra las peticiones que requieren de funcionalidades de diferentes microservicios.
         -  *Componente:* aleph_ag
      -  *Capa de Lógica:* Microservicios independientes con separación de responsabilidades dada por el dominio de funcionalidad de cada una de las verticales, encargados de aplicar la logica de negocio para cada vertical.
         - *aleph_profile_ms:* Gestión de usuarios y perfiles.
         - *aleph_music_ms:* Carga, almacenamiento y metadatos de música.
         - *aleph_reviews_ms:* Comentarios, reseñas y puntuaciones.


      -  *Capa de Data:* La capa de datos se constituye de los componentes de almacenamiento de datos, como son las bases de datos de cada microservicio y un bucket para almacenamiento estático de multimedia (imagenes).
         - *aleph_profile_db:* Base de datos del microservicio de perfiles. Almacena la información de perfiles, ciudades y países.
         - *aleph_profile_bk:* Bucket de almacenamiento de objetos para almacenar archivos multimedia, específicamente, imágenes.
         - *aleph_music_db:* Base de datos del microservicio de música. Permite almacenar los metadatos de las canciones, álbumes y artistas.
         - *aleph_reviews_db:* Base de datos del microservicio de reseñas. Almacena las reseñas, las réplicas o comentarios dentro de las reseñas, 

         
           


   
 - **Description of architectural elements and relations:**
   - ***Elements***
     - *aleph_wfe:* El componente de web frontend es el encargado de la interacción entre el usuario y el sistema. Se encarga de mostrar visualmente las funcionalidades y de facilitar la comunicación, navegación y exploración del usuario dentro de Aleph. Este componente se ha desarrollado por medio de Next.js como el framework principal para el desarrollo de las estructuras y que utilizó Tailwind CSS para la construcción de los diseños y estilos.
       
     - *aleph_ag:* El componente de Apigateway cumple el rol de orquestador central de comunicaciones dentro del sistema Aleph, funcionando como un punto único de entrada que gestiona y orquesta las llamadas entre el frontend y los distintos microservicios que componen la lógica del sistema. Su propósito principal es abstraer la complejidad interna de la arquitectura distribuida, permitiendo que el cliente interactúe con una única interfaz mientras el gateway se encarga de enrutar, consolidar y distribuir las solicitudes hacia los servicios correspondientes. Además, *aleph_ag* posibilita la composición de respuestas cuando una operación requiere información de múltiples microservicios.

     - *leph_profile_ms:* Microservicio encargado de gestionar la información de perfiles de usuarios, como datos personales, entre ellos su país de origen. Se apoya en una base de datos (aleph_profile_db).
     - *aleph_music_ms:* Microservicio encargado de la gestión de datos de canciones, álbumes y artistas registrados dentro del servicio de Aleph. Aporta funcionalidades para facilitar la interacción entre el usuario y el sistema, como la creación, visualización y eliminación de listas personalizadas, las cuales estarán conformadas por canciones que sean del interés del usuario, quien podrá agregarlas o eliminarlas de dichas listas. Además, incluye búsqueda por filtros para encontrar canciones y artistas de la preferencia del usuario, como la visualización de la información a detalle de dichas canciones y/o artistas.

     - *aleph_reviews_ms:* Microservicio encargado de la gestión de reseñas para canciones y álbumes, tomando en cuenta la reseña principal, el voto realizado y los hilos de comentarios qué otros usuarios le realicen a la reseña. Este componente gestionará las operaciones de CREATE para la creación de reseñas, UPDATE para la actualización de reseñas, GET para la visualización de reseñas y DELETE para su eliminación, qué serán realizadas hacia la base de datos (aleph_reviews_db).

     - *aleph_profile_db:* Base de datos principal del aleph_profile_ms., encargada de almacenar información estructurada de usuarios (nombre, biografía, fecha de cumpleaños, etc.). Será una base de datos *PostgreSQL*.

     - *aleph_music_db:* Base de datos del microservicio de canciones, se encarga de manejar datos de las canciones, artistas y álbumes dentro del sistema (nombre del artista, duración de la canción, nombre del álbum, nombre de la canción, letra de las canciones, categorías y filtros, etc.). Para esto se optó por una base de datos *MongoDB*, debido a que es una base de datos flexible y escalable, permitiendo el constante crecimiento de la base de datos para las canciones, siendo la base de datos más grande para nuestro sistema. Adicionalmente, está en la capacidad de manejar documentos con estructuras variables, los cuales están incorporados en este servicio ya que los datos de las canciones manejan las portadas, letras, categorías, etc. 

     - *aleph_reviews_db:* Base de datos principal del microservicio de reseñas, encargada de la persistencia de las reseñas, que incluye las reseñas (título, cuerpo, rating, fechas de creación y actualización, etc.), las réplicas (comentarios realizados dentro de las reseñas, representados en forma de hilos), y los votos (positivos o negativos). Es una base de datos *PostgreSQL*.

     - *aleph_profile_bk:* Almacenamiento de objetos en Amazon S3 (Simple Storage Service) diseñado para guardar archivos asociados a perfiles de usuarios, como imágenes de avatar y portadas.
     - *aleph_auth (Componente externo SaaS):* Auth0 se utilizó en el sistema de Aleph como proveedor externo de identidad utilizado para la gestión centralizada de autenticación de usuarios. Este componente permite a los usuarios iniciar sesión en el sistema de forma segura mediante diferentes métodos de autenticación (correo y contraseña o cuenta de google). Auth0 se encarga del flujo completo de autenticación, generación de tokens (ID Token y Access Token en formato JWT) y manejo seguro de sesiones.
       Una vez autenticado, el usuario recibe un Access Token que es utilizado para autorizar solicitudes hacia los microservicios internos del sistema (como Profile, Songs o Review). Auth0 también proporciona endpoints para registro, recuperación de contraseñas, y validación de sesiones activas.
       
       
   - ***Relations***
     - *aleph_wfe ↔ aleph_ag:* Nuestra API Gateway se comunica con nuestro *aleph_wfe* por medio de *REST* como el conector principal de entre estos dos componentes. Realiza su conexión por medio de peticiones HTTP, como GET’s o POST’s. de manera que el frontend consume los endpoints que ofrece el API Gateway para así realizar las acciones que solicitan los usuarios al interactuar con el sistema y con ello, obtener respuesta de los diferentes microservicios a los cuales el *API Gateway* orquesta.
       
     - *aleph_ag ↔ aleph_profile_ms:* Nuestro API Gateway se comunica con el microservicio de perfiles con un conector de tipo *REST*, usando el protocolo *HTTP*. Se decide utilizar este tipo de conector dado a qué las operaciones implementadas necesitan del uso de operaciones HTTP convencionales (CREATE, POST, PATCH, DELETE, etc.) con su endpoint correspondiente. Las consultas realizadas deben retornar datos concretos o específicos, definidos dentro de cada funcionalidad.   

       
     - *aleph_ag ↔ aleph_music_ms:* Nuestra API Gateway se comunica con el microservicio de canciones mediante un conector *REST*. Se decidió tomar *REST* puesto que nos proporciona herramientas para consultar datos de canciones, artistas, álbumes y listas de reproducción. De esta manera, los usuarios se encuentran en la capacidad de consultar de manera exacta los datos que necesitan. Promueve la modularidad en el sistema, teniendo endpoints bien definidos. 

     - *aleph_ag ↔ aleph_reviews_ms:* El API Gateway se comunica con el microservicio de reviews por medio de un conector de tipo REST, bajo el protocolo HTTP. El uso de *REST* como conector, facilita la ejecución de operaciones HTTP como es la creación, actualización, visualización y eliminación de reseñas y réplicas. Dadas las funcionalidades del componente de reseñas, se requieren realizar operaciones sobre cada recurso utilizando diferentes endpoints para recuperar información específica.

     - *aleph_profile_ms ↔ aleph_profile_db:* El microservicio *aleph_profile_ms*, desarrollado en *Ruby* on *Rails*, se conecta directamente a su base de datos *aleph_profile_db (PostgreSQL)* para gestionar toda la información relacionada con los perfiles de usuario. Esto incluye operaciones como crear nuevos usuarios, actualizar información personal y recuperar datos de perfil cuando se navega por la plataforma. La lógica de negocio reside en el microservicio, mientras que la base de datos actúa como almacenamiento aislado de otros servicios. La conexión entre el microservicio y la base también se realiza a través de TCP.


     - *aleph_music_ms ↔ aleph_music_db:* Para la comunicación entre el microservicio y su base de datos se utilizaron *cursores* para la conexión. Los cuales se usaron como conectores para así ejecutar las operaciones sobre la base de datos. Esta comunicación se realizó bajo el protocolo TCP para poder garantizar una comunicación mutua y un transporte de datos confiable, ya que nos permite controlar el flujo de datos.

     - *aleph_reviews_ms ↔ aleph_reviews_db:* El microservicio *aleph_reviews_ms*, también hecho en *Ruby* on *Rails*, se comunica con su base de datos *aleph_reviews_db* para almacenar y gestionar las reseñas que los usuarios escriben sobre las canciones. La conexión entre el microservicio y la base también se realiza a través de TCP.
       
     - *aleph_profile_ms ↔ aleph_profile_bk:* El microservicio *aleph_profile_ms* se comunica con el bucket de almacenamiento *aleph_profile_bk* para gestionar los archivos multimedia relacionados con los perfiles de usuario, tales como imágenes de avatar y portadas.

     - *Aleph Frontend ↔ Auth0 (SaaS):* El conector entre el frontend (Next.js) y Auth0 se establece a través de la librería oficial de Auth0 para Next.js (@auth0/nextjs-auth0). Este conector se implementa directamente en la capa del frontend y facilita la integración del flujo de autenticación mediante rutas API y hooks React preconfigurados.

       Cuando un usuario accede al sitio, este conector redirige al usuario hacia el dominio de Auth0 para completar el login/logout de forma segura usando HTTPS. Una vez autenticado, Auth0 redirige nuevamente al frontend con un token de sesión, almacenado de forma segura mediante cookies HTTP-only. Este conector también permite obtener los datos del usuario autenticado y sus tokens mediante funciones del lado del servidor (getSession) o en el cliente (useUser).

       Características técnicas del conector:
         - Comunicación vía HTTPS con Auth0 (OAuth 2.0 / OpenID Connect).
         - Uso de endpoints internos del Next.js API (ej: /api/auth/login, /api/auth/logout, /api/auth/callback).
         - Persistencia de sesión vía cookies seguras y JWT.
         - Protección de rutas Middleware nativo de auth0.
      
       Tipo de conexión:
         - Contenedor Aleph frontend(Next.js) Puerto: 3000  ⇄ Internet ⇄ Auth0 (SaaS)
***

# 3. Prototype
- ***Instructions for deploying the software system locally:***
  - *Clonación de repositorio*
  - *Dirigirse a la siguiente ruta dentro del repositorio anteriormente clonado:*
     - 'cd swarch2025i/project/prototype_1/1F'
  - *Ejecutar la orquestación y creación de los componentes:*
     -  'Docker compose up –build'
  - *Ejecutar el siguiente comando en la consola de comandos para poblar la base de datos con el artista que se desee:*
    
  ```
  curl -v -X POST http://localhost:3002/api/v1/music/spotify/import_artist \
  -H "Content-Type: application/json" \
  -d '{"artist": "NombreArtista"}'
  ```




