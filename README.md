# Sistema Kiosco

Aplicación de escritorio para la gestión de kioscos y pequeños comercios: ventas, productos, empleados y control de acceso por roles. Está pensada como una plataforma multi-comercio, donde cada negocio opera sobre sus propios datos de forma aislada.

> [!NOTE]
> El proyecto está en desarrollo activo. La arquitectura y las funcionalidades pueden cambiar.

## Características

- **Punto de venta:** registro de ventas con trazabilidad del usuario que realizó cada una.
- **Productos:** alta, edición y consulta del catálogo de cada comercio.
- **Empleados:** gestión del personal por comercio.
- **Roles y permisos:** autorización aplicada directamente en la base de datos con Row Level Security (RLS).
- **Multitenancy:** cada comercio accede únicamente a sus productos, ventas y empleados.
- **Modo offline (planificado):** caché local en SQLite sincronizada con la nube.

## Stack

| Capa | Tecnología |
|------|------------|
| Aplicación de escritorio | Electron |
| Base de datos y backend | Supabase (PostgreSQL) |
| Autenticación y autorización | Supabase Auth, policies y RLS |
| Caché local (planificado) | SQLite |

## Arquitectura

> [!IMPORTANT]
> El detalle completo de las decisiones técnicas está documentado en [`DECISIONES.md`](./DECISIONES.md).

### Persistencia: de SQLite a Supabase

El proyecto comenzó con persistencia local en SQLite. Se migró a Supabase como base de datos principal para soportar múltiples usuarios y comercios con acceso centralizado. SQLite se conservará a futuro como caché local para operar sin conexión y sincronizar con la nube.

### Precios como enteros

Los precios se almacenan como números enteros para evitar errores de precisión de punto flotante. La conversión a valor monetario se realiza en la capa de aplicación.

### Seguridad con RLS

Los permisos se resuelven en la base de datos mediante policies de Row Level Security, incluyendo funciones recursivas para resolver la jerarquía de roles. Las reglas de acceso no dependen únicamente del cliente.

### Trazabilidad de ventas

Cada venta se relaciona con un usuario, lo que permite auditar quién la realizó y generar reportes por empleado.

### Multitenancy

El esquema aísla los datos por comercio: cada uno solo puede ver y operar sobre sus propios productos, ventas y empleados.

> [!TIP]
> Antes de ejecutar la aplicación, configurá las credenciales de tu proyecto de Supabase (URL y clave pública) en las variables de entorno.

## Estado del proyecto

- [x] Migración de SQLite a Supabase
- [x] Roles y permisos con RLS
- [x] Esquema multitenancy
- [x] Asociación de ventas con usuarios
- [ ] Modo offline con caché local en SQLite
- [ ] Sincronización con la nube
- [ ] Reportes y estadísticas de ventas
