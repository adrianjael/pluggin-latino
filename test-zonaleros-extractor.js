const zonaleros = require('./providers/zonaleros.js');
const extractor = require('./src/zonaleros/extractor.js');

const SEARCH_HTML = `
<!-- Aquí pego el HTML que me dio el usuario -->
<ul class="ListAnimes AX Rows A06 C04 D02">
													        <li>
	<article class="Anime alt B">
		<a href="https://www.zona-leros.com/juegos-pc/avatar-frontiers-of-pandora-complete-edition" title="Avatar Frontiers of Pandora Complete Edition por googledrive">
				<span class='Estreno'><span>Estreno</span></span>
			<div class="Image fa-gamepad">
				<figure>
					<img src="https://www.zona-leros.com/storage/games_tumbl/avatar-frontiers-of-pandora-complete-edition-cover-azf.webp" alt="descargar Avatar Frontiers of Pandora Complete Edition" loading="lazy">
				</figure>
				<span class="Types movie hidden-xs">Altos requisitos</span>
			</div>
			<h3 class="Title">Avatar Frontiers of Pandora Complete Edition</h3>
		</a>
	</article>
</li>
<li>
  <article class="Anime alt B">
    <a href="https://www.zona-leros.com/peliculas/avatar-fuego-y-cenizas-hd">
    	<span class='Estreno'><span>Estreno</span></span>
	      <div class="Image fa-play">
        <figure>
          <img src="https://www.zona-leros.com/storage/movies_tumbl/avatar-fuego-y-cenizas-cover-pgk.webp" alt="ver Avatar: Fuego y cenizas" loading="lazy">
        </figure>
      </div>
      <h3 class="Title">Avatar: Fuego y cenizas</h3>
    </a>
  </article>
</li>
</ul>
`;

console.log("--- TEST EXTRACTOR: BUSQUEDA ---");
const results = extractor.extractSearchResults(SEARCH_HTML);
console.log("Resultados:", JSON.stringify(results, null, 2));

const MOVIE_HTML = `
<h1 class="Title">Avatar: Fuego y cenizas </h1>
<div class="AnimeCover">
    <img src="https://www.zona-leros.com/storage/movies_tumbl/avatar-fuego-y-cenizas-cover-pgk.webp" />
</div>
<div class="Description">Esta es la sinopsis</div>
<script type="text/javascript">
    video10757[107571] = '<iframe frameborder="0" src="https://anomizador.zona-leros.com/l?hs=TEST1" scrolling="no" allowfullscreen></iframe>';
    video10757[107572] = '<iframe frameborder="0" src="https://anomizador.zona-leros.com/l?hs=TEST2" scrolling="no" allowfullscreen></iframe>';
</script>
`;

console.log("\n--- TEST EXTRACTOR: METADATA ---");
const meta = extractor.extractMetadata(MOVIE_HTML);
console.log("Meta:", JSON.stringify(meta, null, 2));
