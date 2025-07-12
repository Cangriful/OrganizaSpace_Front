# Fotos de Perfil

Esta carpeta está destinada para almacenar las fotos de perfil de usuarios y diseñadores.

## Funcionalidad

- Los usuarios pueden subir su foto de perfil durante el registro
- Las fotos se muestran en los chats como avatares
- Se almacenan en formato base64 en localStorage
- Se generan nombres únicos para evitar conflictos
- Se validan tipos de archivo (solo imágenes: JPEG, PNG, GIF, WebP)
- Límite de tamaño: 2MB por foto de perfil

## Estructura de Datos

Las fotos de perfil se almacenan en localStorage con la siguiente estructura:

```json
{
  "nombre": "cliente_1_mi_foto_1234567890.jpg",
  "tipo": "image/jpeg",
  "tamaño": 512000,
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fecha": "2024-01-01T12:00:00.000Z",
  "userId": 1,
  "userType": "cliente"
}
```

## Características

- **Validación**: Solo se permiten archivos de imagen
- **Tamaño máximo**: 2MB por archivo
- **Nombres únicos**: Se generan automáticamente con formato `tipo_id_nombre_timestamp.ext`
- **Limpieza automática**: Las fotos antiguas (más de 90 días) se eliminan automáticamente
- **Responsive**: Las fotos se adaptan a diferentes tamaños de pantalla
- **Fallback**: Si no hay foto de perfil, se muestra un avatar por defecto

## Uso en el Chat

- Los avatares muestran la foto de perfil del usuario si está disponible
- Si no hay foto, se muestra un avatar por defecto (usuario o diseñador)
- Las fotos se cargan dinámicamente desde localStorage
- Manejo de errores: si la foto no carga, se muestra el avatar por defecto

## Notas

- En un entorno de producción, las fotos deberían guardarse en un servidor real
- Esta implementación es solo para pruebas y demostración
- Las fotos se almacenan en el navegador del usuario
- Cada usuario puede tener solo una foto de perfil (se reemplaza la anterior) 