# Markdown link extractor

Markdown link extractor te permite ver los enlaces que hay en un archivo md.

## Caracteristicas

- Extrae enlaces de un archivo md
- Información del enlace:
  Link, linea, texto, estado
- Opción de validar los enlaces 
- Opción de estadísticas de los enlaces 
- Recorre carpetas recursivamente
- Se puede importar como modulo
- Se puede usar por medio de la terminal

## Porque Markdown link extractor?

Aveces tenemos uno o múltiples archivos md que contienen enlaces y puede ser tedioso revisarlos uno a uno para ver su estado o para obtener estadísticas, Markdown Link Extractor te permite indicando la ruta de un archivo o carpeta obtener toda esta información.

## Instalación

#### npm

```bash
npm install Estephanyc/md-links
```

```bash
npm i md-links-extractor
```

## Uso

### Linea de comandos
La ruta ingresada puede ser absoluta o relativa y puede ser un archivo o un directorio

`$ md-links ./some/example.md`
```sh
./some/example.md:10 http://algo.com/2/3/ Link a algo
./some/example.md:15 https://otra-cosa.net/algun-doc.html algún doc
./some/example.md:40 http://google.com/ Google
```

`$ md-links ./some/example.md --validate`
```sh
./some/example.md:10 http://algo.com/2/3/ ok 200 Link a algo
./some/example.md:15 https://otra-cosa.net/algun-doc.html fail 404 algún doc
./some/example.md:40 http://google.com/ ok 301 Google
```
`$ md-links ./some/example.md --stats`
```sh
total: 3 ok : 2 fails: 1
```

### Importar el modulo

```js
const mdLinks = require("md-links");

mdLinks("./some/example.md")
  .then(links => {
    // => [{ href, text, file }]
  })
  .catch(console.error);

mdLinks("./some/example.md", { validate: true })
  .then(links => {
    // => [{ href, text, file, status, ok }]
  })
  .catch(console.error);
  
mdLinks("./some/example.md", { stats: true })
  .then(links => {
    // => [{ href, text, file, status, ok }]
  })
  .catch(console.error);

mdLinks("./some/dir")
  .then(links => {
    // => [{ href, text, file }]
  })
  .catch(console.error);
  ```
