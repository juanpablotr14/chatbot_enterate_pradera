# 🤖 ChatBot “Entérate Pradera”

Bot de atención ciudadana que responde preguntas frecuentes a través de WhatsApp. Utiliza técnicas de Procesamiento de Lenguaje Natural (PLN) con TF-IDF y similitud del coseno para identificar la intención del usuario y responder con texto e imágenes.

## 📦 Tecnologías usadas

- [Node.js](https://nodejs.org/)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [natural](https://github.com/NaturalNode/natural)
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal)

## 📁 Estructura del proyecto

chatbot/
├── assets/
│ ├── bienvenida.png
│ └── respuestas/
├── corpus.json
├── index.js
├── no_reconocidas.txt
├── package.json


## 🔧 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/juanpablotr14/chatbot_enterate_pradera.git
   cd entérate-pradera-bot
  ``

2. Instala las dependencias:
  ```bash
   npm install


## 🚀 Ejecución

1. Ejecutar el bot:
   ```bash
   node index.js
  ``

2. Escanea el código QR con WhatsApp para conectar tu sesión.

3. El bot enviará automáticamente un mensaje de bienvenida a los usuarios definidos y responderá a los mensajes que reciba.

## 🧠 Características

- Análisis de intención con TF-IDF + Cosine Similarity.

- Respuestas automáticas desde un corpus JSON.

- Soporte para envío de imágenes.

- Registro de preguntas no reconocidas en no_reconocidas.txt.
