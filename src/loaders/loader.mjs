/**
 * 
 * Package: require-urls
 * Author: Ganesh B
 * Description: Nodejs npm module to traverse folder using code or cli or use glob patterns
 * Install: npm i require-urls --save
 * Github: https://github.com/ganeshkbhat/requireurl
 * npmjs Link: https://www.npmjs.com/package/require-urls
 * File: loader.mjs
 * File Description: Using require-urls instead of require to fetch files from git repositories like Github or Bitbucket like repository directly
 * 
 * git-rest: https://www.softwaretestinghelp.com/github-rest-api-tutorial/#:~:text=Log%20in%20to%20your%20GitHub,and%20click%20on%20Create%20Token.
 * 
*/

/* eslint no-console: 0 */

'use strict';

import requireurls from "../../index.mjs";


// CoffeeScript files end in .coffee, .litcoffee, or .coffee.md.
const coffeeExtensionsRegex = /\.coffee$|\.litcoffee$|\.coffee\.md$/;

// Module package.json files end in package.json
const packagejsonExtensionsRegex = /\package\.json$/;

// Module ts files end in .ts
const tsExtensionsRegex = /\.ts$/;


/**
 *
 * resolve
 *
 * @export
 * @param {*} specifier
 * @param {*} context
 * @param {*} nextResolve
 * @return {*} 
 */
export function resolve(specifier, context, nextResolve) {
  const { parentURL = null } = context;
  // if (!!parentURL) {
  //   return nextResolve(specifier);
  // }

  /*
   * 
   * Normally Node.js would error on specifiers starting with 'https://', so
   * this hook intercepts them and converts them into absolute URLs to be
   * passed along to the later hooks below
   * 
  */
  if (specifier.startsWith('https://') || specifier.startsWith('http://')) {
    return {
      shortCircuit: true,
      url: specifier
    };
  } else if (parentURL && (parentURL.startsWith('https://') || parentURL.startsWith('http://'))) {
    return {
      shortCircuit: true,
      url: new URL(specifier, parentURL).href,
    };
  }

  /**
   * 
   * Let Node.js handle all other specifiers
   * 
   */
  return nextResolve(specifier);
}


/**
 * 
 * load
 * 
 * @export
 * @param {*} url
 * @param {*} context
 * @param {*} nextLoad
 * @return {*} 
 */
export function load(url, context, nextLoad) {

  /** 
   * 
   * For JavaScript to be loaded over the network, we need to 
   * fetch and return it
   * 
   */
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return new Promise((resolve, reject) => {
      let frm = url.endsWith(".js") ?
        "commonjs" : url.endsWith(".cjs") ?
          "commonjs" : url.endsWith(".json") ?
            "json" : url.endsWith(".mjs") ?
              "module" : url.endsWith(".wasm") ?
                "wasm" : "builtin";
      try {

        if (typeof requireurls.then === "function") {
          return requireurls(url).then((data) => {
            resolve({
              format: frm,
              shortCircuit: true,
              source: String(data),
            })
          });
        }

        let data = requireurls(url);

        if (typeof data === "object" && ["commonjs", "json"].includes(frm)) {
          if (frm === "json") {
            data = JSON.stringify(data);
          }
          return () => {
            resolve({
              format: frm,
              shortCircuit: true,
              source: String(data),
            })
          };
        } else {
          return () => {
            resolve({
              format: frm,
              shortCircuit: true,
              source: String(data),
            })
          }
        }

      } catch (err) {
        console.error("loader.mjs: Fetch err.toString: ", err.toString());
        return () => {
          reject({
            format: frm,
            shortCircuit: true,
            source: String(err),
          })
        }
      }
    });
  }

  /**
   * 
   * Let Node.js handle all other specifiers
   *
   */
  return nextLoad(url);
}

