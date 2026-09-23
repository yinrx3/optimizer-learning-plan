(function(){
  function fail(){
    document.querySelectorAll('span.math').forEach(function(el){
      el.style.fontFamily='ui-monospace,Consolas,monospace';
      el.style.color='#a8562a';
    });
    if (document.getElementById('katex-offline')) return;
    var n=document.createElement('div'); n.id='katex-offline';
    n.style.cssText='position:fixed;left:0;right:0;bottom:0;padding:9px 16px;background:#fdf3e7;border-top:1px solid #e6c9a8;color:#8a5a2b;font-size:13px;z-index:99';
    n.textContent='公式渲染需要联网加载 KaTeX；当前断网，下方显示的是 LaTeX 源码，不影响阅读。';
    document.body.appendChild(n);
  }
  if (typeof katex==='undefined'){ fail(); return; }
  var o={throwOnError:false,errorColor:'#a8562a',strict:false,trust:false};
  document.querySelectorAll('span.math').forEach(function(el){
    var d=el.classList.contains('display');
    try{ katex.render(el.textContent, el, Object.assign({},o,{displayMode:d})); }
    catch(e){ el.style.color='#a8562a'; }
  });
})();