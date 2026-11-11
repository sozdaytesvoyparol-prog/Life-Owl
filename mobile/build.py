import re
import os
ROOT=os.path.dirname(os.path.abspath(__file__))
S=os.path.join(ROOT,'..','desktop','src')+os.sep
html=open(S+'index.html',encoding='utf-8').read()
css=open(S+'styles.css',encoding='utf-8').read()
def conv(m):
    n=float(m.group(1))
    if abs(n)<=1.5: return m.group(0)
    v=round(n/16,4); s=('%.4f'%v).rstrip('0').rstrip('.')
    return s+'rem'
css=re.sub(r'(?<![\w#.-])(-?\d*\.?\d+)px\b',conv,css)
css+= '\n'+open(os.path.join(ROOT,'mobile.css'),encoding='utf-8').read()
js=open(S+'app.js',encoding='utf-8').read(); i18n=open(S+'i18n.js',encoding='utf-8').read(); mjs=open(os.path.join(ROOT,'mobile.js'),encoding='utf-8').read()
shim=open(os.path.join(ROOT,'shim.js'),encoding='utf-8').read()
# масштаб интерфейса: rem
assert '__loBase' in shim
js=js.replace("window.lifeOwlApi.lastUser().then(","if (window.lifeOwlApi.resume) window.lifeOwlApi.resume().then(function (r) { if (r) enterApp(r); });\n  window.lifeOwlApi.lastUser().then(",1); assert 'resume' in js
head='''<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<meta name="theme-color" content="#04061a">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Life Owl">
<title>Life Owl</title>'''
body=html[html.index('<body'):html.index('<script src="i18n.js">')]
body=re.sub(r'<!-- Кнопки окна -->\s*<div id="winctl".*?</div>\s*(?=<!-- Экран входа)','',body,flags=re.S)
body=body.replace('<header class="topbar">','<header class="topbar"><div class="m-logo"><svg viewBox="0 0 24 24" class="star"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg><span>Life Owl</span></div>',1)
out='<!DOCTYPE html>\n<html lang="ru">\n<head>\n'+head+'\n<style>\n'+css+'\n</style>\n</head>\n'+body+'<script>\n'+shim+'\n</script>\n<script>\n'+open(S+'config.js',encoding='utf-8').read()+'\n</script>\n<script>\n'+i18n+'\n</script>\n<script>\n'+js+'\n</script>\n<script>\n'+mjs+'\n</script>\n</body>\n</html>\n'
os.makedirs(os.path.join(ROOT,'www'),exist_ok=True); open(os.path.join(ROOT,'www','index.html'),'w',encoding='utf-8').write(out); print(len(out))
