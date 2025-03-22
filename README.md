<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Un viatge musical i dansat</title>
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(to bottom right, #1a1a40, #4b0082);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-image: url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?fit=crop&w=1400&q=80');
      background-size: cover;
      background-position: center;
      text-shadow: 1px 1px 3px #000;
    }

    h1 {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    button {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 10px;
      background-color: #ff4081;
      color: white;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    button:hover {
      background-color: #ff79a7;
    }
  </style>
</head>
<body>
  <h1>Un viatge musical i dansat</h1>
  <button onclick="comencarJoc()">Començar el joc</button>

  <script>
    function comencarJoc() {
      alert("Fase següent: inici del joc 🎵");
      // Aquí després podem redirigir a la següent pàgina o carregar les preguntes
    }
  </script>
</body>
</html>

