-- 把 Pandoc 的 Math 元素原样转成 HTML span，交给浏览器端 KaTeX 渲染。
-- 这样完全绕开 Pandoc 自己的 TeX 解析器（它会拒绝 \lVert、\textstyle 等写法）。
function Math(el)
  local cls = 'math'
  if el.mathtype == 'DisplayMath' then cls = 'math display' end
  return pandoc.RawInline('html', '<span class="' .. cls .. '">' .. el.text .. '</span>')
end
