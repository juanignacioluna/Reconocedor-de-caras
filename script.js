

Promise.all([

  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')

]).then(inicio)

async function inicio() {

  const contenedor = document.createElement('div');

  contenedor.style.position = 'relative';

  document.getElementById('main').append(contenedor);

  const jugadorFaceDescriptors = await cargarJugadores();

  const faceMatcher = new faceapi.FaceMatcher(jugadorFaceDescriptors, 0.6);

  let image;

  let canvas;

  document.getElementById('cargando').remove();



  const fileInput1 = document.createElement('input');

  fileInput1.type = 'file';

  fileInput1.id = 'img';

  document.getElementById('main').append(fileInput1);




  let fileInput2 = document.getElementById('img');

  fileInput2.addEventListener('change', async () => {


    if (image) image.remove();

    if (canvas) canvas.remove();

    image = await faceapi.bufferToImage(fileInput2.files[0]);

    contenedor.append(image);

    canvas = faceapi.createCanvasFromMedia(image);

    contenedor.append(canvas);

    const displaySize = { width: image.width, height: image.height };

    faceapi.matchDimensions(canvas, displaySize);



    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const resultados = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));


    resultados.forEach((result, i) => {

      const box = resizedDetections[i].detection.box;

      const dibujarBox = new faceapi.draw.DrawBox(box, { label: result.toString() });

      dibujarBox.draw(canvas);
    
    })
  

  })
}

function cargarJugadores() {

  const jugadores = ['iniesta', 'messi', 'Abidal', 'Bojan',
  'Busquets', 'Chigrinskiy', 'Dani Alves', 'Gabi Milito', 
  'Henry', 'Jeffren', 'Keita', 'Maxwell', 'Pedro', 'Pinto', 
  'Pique', 'Puyol', 'Rafa Marquez', 'Victor Valdes', 
  'Xavi', 'Yaya Toure', 'Zlatan'];

  return Promise.all(

    jugadores.map(async jugador => {

      const descriptions = [];

      for (let i = 1; i <= 2; i++) {

        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/juanignacioluna/test07/master/${jugador}.png`);

        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        descriptions.push(detections.descriptor);

      }

      return new faceapi.LabeledFaceDescriptors(jugador, descriptions);

    })


  )
}
