const fs = require('fs');
const natural = require('natural');
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');

// Lista de usuarios a los que se envía el mensaje de bienvenida
const usuariosIniciales = [
    '573001234567@c.us',
    '573008765432@c.us'
];

// Cargar corpus
const corpus = JSON.parse(fs.readFileSync('corpus.json', 'utf-8'));

// Iniciar cliente
const client = new Client();

// TF-IDF + Cosine Similarity
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Calcular similitud del coseno entre dos vectores
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
};

// Indexar todas las preguntas del corpus
const tfidf = new TfIdf();
corpus.forEach(item => tfidf.addDocument(item.pregunta));

// Buscar la mejor respuesta usando TF-IDF + similitud del coseno
function buscarRespuesta(inputUsuario) {
    const tokensEntrada = tokenizer.tokenize(inputUsuario.toLowerCase());

    // Crear modelo temporal solo con la pregunta del usuario
    const tfidfConsulta = new TfIdf();
    tfidfConsulta.addDocument(inputUsuario.toLowerCase());

    let mejorSimilitud = 0;
    let mejorIndex = -1;

    for (let i = 0; i < corpus.length; i++) {
        const tokensCorpus = tokenizer.tokenize(corpus[i].pregunta.toLowerCase());
        const allTokens = Array.from(new Set([...tokensEntrada, ...tokensCorpus]));

        const vectorEntrada = allTokens.map(t => tfidfConsulta.tfidf(t, 0)); // Documento 0: input del usuario
        const vectorDoc = allTokens.map(t => tfidf.tfidf(t, i));             // Documento i: pregunta del corpus

        const similitud = cosineSimilarity(vectorEntrada, vectorDoc);

        if (similitud > mejorSimilitud) {
            mejorSimilitud = similitud;
            mejorIndex = i;
        }
    }

    // Si no hay coincidencia significativa
    if (mejorSimilitud < 0.2) {
        fs.appendFileSync('no_reconocidas.txt', `${inputUsuario}\n`);
        return {
            respuesta: "Lo siento, no entendí tu pregunta. ¿Podrías reformularla?"
        };
    }

    return corpus[mejorIndex];
}

// Código QR
client.on('qr', qr => qrcode.generate(qr, { small: true }));

// Cliente listo, mensaje de bienvenida
client.on('ready', async () => {
    console.log('✅ Cliente listo');

    // Enviar mensaje de bienvenida
    const media = MessageMedia.fromFilePath('./assets/bienvenida.png');
    for (const numero of usuariosIniciales) {
        await client.sendMessage(numero, media);
        await client.sendMessage(numero, '¡Hola! 👋 Somos *Entérate Pradera*. Aquí puedes consultar horarios de buses, números importantes, loterías, farmacias y más. 🚌📲🎉');
    }
});

// Manejo de mensajes recibidos
client.on('message', async message => {
    // Evitar procesar tus propios mensajes o mensajes vacíos
    if (message.fromMe || !message.body.trim()) return;
    // Ignorar enlaces
    if (message.body.includes("http")) return;

    console.log('📩 Mensaje recibido: ', message.body);

    const respuesta = buscarRespuesta(message.body);

    // Enviar texto
    if (respuesta.respuesta) {
        await client.sendMessage(message.from, respuesta.respuesta);
    }

    // Enviar imágenes si existen
    if (respuesta.imagenes && Array.isArray(respuesta.imagenes)) {
        for (const ruta of respuesta.imagenes) {
            if (fs.existsSync(ruta)) {
                const media = MessageMedia.fromFilePath(ruta);
                await client.sendMessage(message.from, media);
            }
        }
    }
});

// Iniciar sesión
client.initialize();