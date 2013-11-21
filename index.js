var urlLib = require('url');
var _s = require('underscore.string');

/**
 * Rewrites XHR requests to be proxied at the local address
 *
 * For example, To rewrite https://some.example.com to
 * http://[currentHost]/proxy/some-example-com/[pathname] do:
 *
 *    xhrRewriteHack({ 'some.example.com': 'http://' + location.host + '/proxy' });
 *
 * @param {Object} hostsToReplaceMap An object of hosts to rewrite and their rewrite paths
 */
function xhrRewriteHack(hostsToReplaceMap) {
  // Take the original open xhr
  var originalOpen = XMLHttpRequest.prototype.open;

  // Override XHR.open
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    var parsedUrl = urlLib.parse(url.toLowerCase());
    
    // Find the hosts
    var replacementBase = hostsToReplaceMap[parsedUrl.host];

    // By default don't replace anything
    var replacementUrl = url;

    // If there is something to replace then replace it
    if(replacementBase) {
      var hostNameToPath = parsedUrl.hostname.replace('.', '-');
      var pathname = parsedUrl.pathname;
      replacementUrl = _s.sprintf('%s/%s%s', 
                                  replacementBase,
                                  hostNameToPath,
                                  pathname);
    }
    originalOpen.call(this, method, replacementUrl, async, user, password);
  };
}
