# Configuracion de Google Sheet

## 1. Crear la hoja

1. Abre [Google Sheets](https://sheets.google.com) y crea una hoja nueva.
2. Crea 6 pestañas con estos nombres exactos: `Character`, `Possessions`, `Codewords`, `Titles`, `Ticks`, `Notes`.

La app crea las pestañas automaticamente si no existen (requiere permisos de edicion).

## 2. Compartir la hoja

1. Click en "Compartir".
2. En "Acceso general": **"Cualquier persona con el enlace"** > **"Editor"**.

## 3. Copiar el ID

URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

Copia lo que esta entre `/d/` y `/edit`.

## 4. Conectar la app

Abre la app, pega el Sheet ID o la URL completa. Sincroniza automaticamente.

## 5. API Key (desarrolladores)

1. [Google Cloud Console](https://console.cloud.google.com/) > proyecto nuevo.
2. Habilita **Google Sheets API**.
3. Credenciales > **API Key**. Restringe a tu dominio y a Sheets API.
4. Archivo `.env` en la raiz del proyecto:

```
VITE_GOOGLE_API_KEY=tu_api_key
```

## Estructura de la hoja

### Character (A=campo, B=valor)

| Fila | Campo | Tipo |
|------|-------|------|
| 1 | name | texto |
| 2 | god | texto |
| 3 | companion | texto |
| 4 | book | numero |
| 5-8 | charm/grace/ingenuity/strength | numero |
| 9 | blessings | numero |
| 10 | wounded | TRUE/FALSE |
| 11-14 | glory/scars/money/location | numero |

### Possessions: nombre + 4 modificadores (charm, grace, ingenuity, strength)
### Codewords: book number + codeword
### Titles: una columna con el titulo
### Ticks: book + page + TRUE/FALSE por tick
### Notes: una columna con la nota
