# Carpeta de Imágenes del Chat

Esta carpeta está destinada para almacenar las imágenes que se suben en los mensajes del chat.

## Funcionalidad

- Las imágenes se guardan automáticamente cuando los usuarios las suben en el chat
- Se almacenan en formato base64 en localStorage para simular un servidor real
- Se generan nombres únicos para evitar conflictos
- Se validan tipos de archivo (solo imágenes: JPEG, PNG, GIF, WebP)
- Límite de tamaño: 5MB por imagen

## Estructura de Datos

Las imágenes se almacenan en localStorage con la siguiente estructura:

```json
{
  "nombre": "imagen_1234567890.jpg",
  "tipo": "image/jpeg",
  "tamaño": 1024000,
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fecha": "2024-01-01T12:00:00.000Z"
}
```

## Características

- **Validación**: Solo se permiten archivos de imagen
- **Tamaño máximo**: 5MB por archivo
- **Nombres únicos**: Se generan automáticamente con timestamp
- **Limpieza automática**: Las imágenes antiguas (más de 30 días) se eliminan automáticamente
- **Responsive**: Las imágenes se adaptan a diferentes tamaños de pantalla

## Notas

- En un entorno de producción, las imágenes deberían guardarse en un servidor real
- Esta implementación es solo para pruebas y demostración
- Las imágenes se almacenan en el navegador del usuario 