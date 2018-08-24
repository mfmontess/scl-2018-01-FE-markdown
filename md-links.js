const Marked = require('marked');
const fs = require('fs');
const fetch = require('node-fetch');
const pathNode = require('path');
let validate = stats = false;
let mdLinks = {};

mdLinks.mdLinks = (path, options) => {
  return new Promise((resolve, reject) => {
    if (!path)reject('Ingrese un archivo o directorio');
    if (options) {
      if (options.validate) validate = true;
      if (options.stats) stats = true, validate = true; 
    }
    let fileOrDirectory = mdLinks.validateIsFileOrDirectory(path);
    if (fileOrDirectory === 'file') {
      mdLinks.processFile(path).then(response => resolve(response))
        .catch(err => reject(err));
    } else if (fileOrDirectory === 'directory') {
      mdLinks.processDirectory(path).then(response => resolve(response))
        .catch(err => reject(err));
    } else {
      reject(fileOrDirectory);
    }
  });
};
mdLinks.processDirectory = (path) =>{
  return new Promise((resolve, reject) => {
    let files;
    try {
      files = fs.readdirSync(path, 'utf8');
    } catch (err) {
      reject(err);
    }
    let promises = [];
    files.forEach(file => {
      if (mdLinks.validateIsMarkDown(file)) {
        promises.push(mdLinks.processFile(path + file).then(response => response)
          .catch(err => reject(err)));
      }
    });
    Promise.all(promises).then(values => resolve(values.reduce((elem1, elem2) => elem1.concat(elem2))));
  });
};
mdLinks.processFile = (path) => {
  return new Promise((resolve, reject) => {
    if (mdLinks.validateIsMarkDown(path)) {
      path = pathNode.resolve(path);
      let data = fs.readFileSync(path, 'utf8').split('\n');
      let links = data.map(element => mdLinks.markdownLinkExtractor(path, element, data.indexOf(element) + 1));
      links = links.filter(element => element.length !== 0);
      if (links.length !== 0) links = links.reduce((elem1, elem2) => elem1.concat(elem2));
      if (validate) {
        mdLinks.validateUrl(links).then((values) =>{
          Promise.all(values).then((values) =>{
            if (stats) resolve(mdLinks.stats(values));
            else resolve(values);
          });
        });
      } else resolve(links);
    } else reject('No es un archivo markdown');
  });
};
mdLinks.validateUrl = (links) =>{
  return new Promise((resolve, reject) => {
    let promises = [];
    links.forEach((link)=>{
      promises.push(fetch(link.href)
        .then(res => {
          link.status = res.status;
          link.ok = res.statusText;
          return link;
        }).catch((e) =>{
          link.status = 'fail';
          link.ok = 'fail';
          return link;
        })
      );
      resolve(promises);
    });
  });
};
mdLinks.validateIsFileOrDirectory = (path) => {
  try {
    let stats = fs.statSync(path);
    if (stats.isFile()) return ('file');
    else if (stats.isDirectory()) return ('directory');
  } catch (err) {
    return ('No es un archivo ni directorio');
  }
};

mdLinks.validateIsMarkDown = (file) => {
  let allowedExtension = /(\.md)$/i;
  return result = !allowedExtension.exec(file) ? false : true;
};
mdLinks.stats = (links)=>{
  return [{ total: links.length,
    ok: links.filter(link => link.ok === 'OK').length,
    fails: links.filter(link => link.ok === 'fail').length, 
  }];
};
mdLinks.markdownLinkExtractor = (path, markdown, line) => {
  const links = [];
  const renderer = new Marked.Renderer();
  const linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;

  Marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;

  renderer.link = function(href, title, text) {
    links.push({
      href: href,
      text: text,
      path: path,
      line: line
    });
  };
  renderer.image = function(href, title, text) {
    // Remove image size at the end, e.g. ' =20%x50'
    href = href.replace(/ =\d*%?x\d*%?$/, '');
    links.push({
      href: href,
      text: text,
      path: path,
      line: line
    });
  };
  Marked(markdown, { renderer: renderer });

  return links;
};
module.exports = mdLinks;