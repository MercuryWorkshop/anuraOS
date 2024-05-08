(()=>{var d=self.Ultraviolet,w=["cross-origin-embedder-policy","cross-origin-opener-policy","cross-origin-resource-policy","content-security-policy","content-security-policy-report-only","expect-ct","feature-policy","origin-isolation","strict-transport-security","upgrade-insecure-requests","x-content-type-options","x-download-options","x-frame-options","x-permitted-cross-domain-policies","x-powered-by","x-xss-protection"],x=["GET","HEAD"],p=class extends d.EventEmitter{constructor(e=__uv$config){super(),e.prefix||(e.prefix="/service/"),this.config=e,this.bareClient=new d.BareClient}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)}async fetch({request:e}){let o;try{if(!e.url.startsWith(location.origin+this.config.prefix))return await fetch(e);let t=new d(this.config);typeof this.config.construct=="function"&&this.config.construct(t,"service");let g=await t.cookie.db();t.meta.origin=location.origin,t.meta.base=t.meta.url=new URL(t.sourceUrl(e.url));let i=new b(e,t,x.includes(e.method.toUpperCase())?null:await e.blob());if(t.meta.url.protocol==="blob:"&&(i.blob=!0,i.base=i.url=new URL(i.url.pathname)),e.referrer&&e.referrer.startsWith(location.origin)){let s=new URL(t.sourceUrl(e.referrer));(i.headers.origin||t.meta.url.origin!==s.origin&&e.mode==="cors")&&(i.headers.origin=s.origin),i.headers.referer=s.href}let u=await t.cookie.getCookies(g)||[],y=t.cookie.serialize(u,t.meta,!1);i.headers["user-agent"]=navigator.userAgent,y&&(i.headers.cookie=y);let f=new h(i,null,null);if(this.emit("request",f),f.intercepted)return f.returnValue;o=i.blob?"blob:"+location.origin+i.url.pathname:i.url;let c=await this.bareClient.fetch(o,{headers:i.headers,method:i.method,body:i.body,credentials:i.credentials,mode:i.mode,cache:i.cache,redirect:i.redirect}),r=new m(i,c),a=new h(r,null,null);if(this.emit("beforemod",a),a.intercepted)return a.returnValue;for(let s of w)r.headers[s]&&delete r.headers[s];if(r.headers.location&&(r.headers.location=t.rewriteUrl(r.headers.location)),e.destination==="document"){let s=r.headers["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(s)){let l=/^\s*?attachment/i.test(s)?"attachment":"inline",[v]=new URL(c.finalURL).pathname.split("/").slice(-1);r.headers["content-disposition"]=`${l}; filename=${JSON.stringify(v)}`}}if(r.headers["set-cookie"]&&(Promise.resolve(t.cookie.setCookies(r.headers["set-cookie"],g,t.meta)).then(()=>{self.clients.matchAll().then(function(s){s.forEach(function(l){l.postMessage({msg:"updateCookies",url:t.meta.url.href})})})}),delete r.headers["set-cookie"]),r.body)switch(e.destination){case"script":case"worker":{let s=[t.bundleScript,t.clientScript,t.configScript,t.handlerScript].map(l=>JSON.stringify(l)).join(",");r.body=`if (!self.__uv && self.importScripts) { ${t.createJsInject(t.cookie.serialize(u,t.meta,!0),e.referrer)} importScripts(${s}); }
`,r.body+=t.js.rewrite(await c.text())}break;case"style":r.body=t.rewriteCSS(await c.text());break;case"iframe":case"document":k(t.meta.url,r.headers["content-type"]||"")&&(r.body=t.rewriteHtml(await c.text(),{document:!0,injectHead:t.createHtmlInject(t.handlerScript,t.bundleScript,t.clientScript,t.configScript,t.cookie.serialize(u,t.meta,!0),e.referrer)}))}return i.headers.accept==="text/event-stream"&&(r.headers["content-type"]="text/event-stream"),crossOriginIsolated&&(r.headers["Cross-Origin-Embedder-Policy"]="require-corp"),this.emit("response",a),a.intercepted?a.returnValue:new Response(r.body,{headers:r.headers,status:r.status,statusText:r.statusText})}catch(t){return["document","iframe"].includes(e.destination)?(console.error(t),U(t,o)):new Response(void 0,{status:500})}}static Ultraviolet=d};self.UVServiceWorker=p;var m=class{constructor(e,o){this.request=e,this.raw=o,this.ultraviolet=e.ultraviolet,this.headers={};for(let t in o.rawHeaders)this.headers[t.toLowerCase()]=o.rawHeaders[t];this.status=o.status,this.statusText=o.statusText,this.body=o.body}get url(){return this.request.url}get base(){return this.request.base}set base(e){this.request.base=e}},b=class{constructor(e,o,t=null){this.ultraviolet=o,this.request=e,this.headers=Object.fromEntries(e.headers.entries()),this.method=e.method,this.body=t||null,this.cache=e.cache,this.redirect=e.redirect,this.credentials="omit",this.mode=e.mode==="cors"?e.mode:"same-origin",this.blob=!1}get url(){return this.ultraviolet.meta.url}set url(e){this.ultraviolet.meta.url=e}get base(){return this.ultraviolet.meta.base}set base(e){this.ultraviolet.meta.base=e}};function k(n,e=""){return(d.mime.contentType(e||n.pathname)||"text/html").split(";")[0]==="text/html"}var h=class{#e;#t;constructor(e={},o=null,t=null){this.#e=!1,this.#t=null,this.data=e,this.target=o,this.that=t}get intercepted(){return this.#e}get returnValue(){return this.#t}respondWith(e){this.#t=e,this.#e=!0}};function S(n,e){let o=`
        errorTrace.value = ${JSON.stringify(n)};
        fetchedURL.textContent = ${JSON.stringify(e)};
        for (const node of document.querySelectorAll("#uvHostname")) node.textContent = ${JSON.stringify(location.hostname)};
        reload.addEventListener("click", () => location.reload());
        uvVersion.textContent = ${JSON.stringify("3.1.2")};
    `;return`<!DOCTYPE html>
        <html>
        <head>
        <meta charset='utf-8' />
        <title>Error</title>
        <style>
        * { background-color: white }
        </style>
        </head>
        <body>
        <h1 id='errorTitle'>Error processing your request</h1>
        <hr />
        <p>Failed to load <b id="fetchedURL"></b></p>
        <p id="errorMessage">Internal Server Error</p>
        <textarea id="errorTrace" cols="40" rows="10" readonly></textarea>
        <p>Try:</p>
        <ul>
        <li>Checking your internet connection</li>
        <li>Verifying you entered the correct address</li>
        <li>Clearing the site data</li>
        <li>Contacting <b id="uvHostname"></b>'s administrator</li>
        <li>Verify the server isn't censored</li>
        </ul>
        <p>If you're the administrator of <b id="uvHostname"></b>, try:</p>
        <ul>
        <li>Restarting your server</li>
        <li>Updating Ultraviolet</li>
        <li>Troubleshooting the error on the <a href="https://github.com/titaniumnetwork-dev/Ultraviolet" target="_blank">GitHub repository</a></li>
        </ul>
        <button id="reload">Reload</button>
        <hr />
        <p><i>Ultraviolet v<span id="uvVersion"></span></i></p>
        <script src="${"data:application/javascript,"+encodeURIComponent(o)}"><\/script>
        </body>
        </html>
        `}function U(n,e){let o={"content-type":"text/html"};return crossOriginIsolated&&(o["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(S(String(n),e),{status:500,headers:o})}})();
//# sourceMappingURL=uv.sw.js.map
