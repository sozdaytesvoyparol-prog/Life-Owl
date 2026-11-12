"""Правит сгенерированный Capacitor-проект: горизонтальный экран, полный экран, аппаратное ускорение."""
import os, re, glob
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'android', 'app', 'src', 'main')
man = os.path.join(A, 'AndroidManifest.xml')
s = open(man, encoding='utf-8').read()
if 'screenOrientation' not in s:
    s = s.replace('<activity', '<activity\n            android:screenOrientation="sensorLandscape"', 1)
if 'hardwareAccelerated' not in s:
    s = s.replace('<application', '<application\n        android:hardwareAccelerated="true"', 1)
open(man, 'w', encoding='utf-8').write(s)
for st in glob.glob(os.path.join(A, 'res', 'values', 'styles.xml')):
    t = open(st, encoding='utf-8').read()
    extra = ('<item name="android:windowFullscreen">true</item>'
             '<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>'
             '<item name="android:windowBackground">@android:color/black</item>')
    if 'windowFullscreen' not in t:
        t = re.sub(r'(<style name="AppTheme\.NoActionBar"[^>]*>)', r'\1' + extra, t)
        t = re.sub(r'(<style name="AppTheme\.NoActionBarLaunch"[^>]*>)', r'\1' + extra, t)
    open(st, 'w', encoding='utf-8').write(t)
print('android patched')

# частота кадров: просим у системы самый высокий режим экрана (90/120 Гц) с тем же разрешением
for mj in glob.glob(os.path.join(A, 'java', '**', 'MainActivity.java'), recursive=True):
    old = open(mj, encoding='utf-8').read()
    m = re.search(r'^package\s+([\w.]+);', old, re.M)
    pkg = m.group(1) if m else 'com.lifeowl.app'
    code = '''package %s;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (Build.VERSION.SDK_INT >= 23) {
                Display d = getWindowManager().getDefaultDisplay();
                Display.Mode cur = d.getMode(), best = cur;
                for (Display.Mode m : d.getSupportedModes()) {
                    if (m.getPhysicalWidth() == cur.getPhysicalWidth() && m.getPhysicalHeight() == cur.getPhysicalHeight() && m.getRefreshRate() > best.getRefreshRate()) best = m;
                }
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.preferredDisplayModeId = best.getModeId();
                getWindow().setAttributes(lp);
            }
        } catch (Throwable ignored) { }
    }
}
''' % pkg
    open(mj, 'w', encoding='utf-8').write(code)
    print('MainActivity patched', pkg)
