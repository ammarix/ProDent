/**
 * ProDent Storage & Export Helper
 * Handles seamless backup saving across:
 * 1. Capacitor / Android Native Plugin via MediaStore API (Downloads/ProDent)
 * 2. Capacitor Filesystem Plugin
 * 3. Modern Browser / PWA File System Access API (showSaveFilePicker)
 * 4. Standard Web Blob download link (with explicit download triggering)
 */

export interface ExportResult {
  success: boolean;
  destination: string;
  fileName: string;
}

export async function saveBackupFile(fileName: string, jsonString: string): Promise<ExportResult> {
  const win = window as any;

  // 1. Android Native Capacitor Plugin (ProDentMediaStore)
  if (win.Capacitor?.Plugins?.ProDentMediaStore?.saveBackup) {
    try {
      const res = await win.Capacitor.Plugins.ProDentMediaStore.saveBackup({
        fileName,
        content: jsonString,
      });
      if (res && res.success !== false) {
        return {
          success: true,
          destination: res.path || 'Downloads/ProDent/' + fileName,
          fileName,
        };
      }
    } catch (e: any) {
      console.warn('ProDentMediaStore plugin failed, falling back:', e);
    }
  }

  // 2. Android JavascriptInterface bridge (if embedded in standard WebView: window.ProDentNative or window.Android)
  if (win.ProDentNative?.saveFileToDownloads) {
    try {
      const res = await Promise.resolve(win.ProDentNative.saveFileToDownloads(fileName, jsonString));
      return {
        success: true,
        destination: typeof res === 'string' ? res : 'Downloads/ProDent/' + fileName,
        fileName,
      };
    } catch (e: any) {
      console.warn('ProDentNative bridge failed, falling back:', e);
    }
  }

  if (win.Android?.saveFileToDownloads) {
    try {
      const res = await Promise.resolve(win.Android.saveFileToDownloads(fileName, jsonString));
      return {
        success: true,
        destination: typeof res === 'string' ? res : 'Downloads/ProDent/' + fileName,
        fileName,
      };
    } catch (e: any) {
      console.warn('Android bridge failed, falling back:', e);
    }
  }

  // 3. Capacitor Official Filesystem Plugin (if installed in project)
  if (win.Capacitor?.Plugins?.Filesystem?.writeFile) {
    try {
      await win.Capacitor.Plugins.Filesystem.writeFile({
        path: `ProDent/${fileName}`,
        data: jsonString,
        directory: 'DOCUMENTS',
        recursive: true,
      });
      return {
        success: true,
        destination: `مستندات الجهاز/ProDent/${fileName}`,
        fileName,
      };
    } catch (e: any) {
      console.warn('Capacitor Filesystem failed, falling back to Web:', e);
    }
  }

  // 4. File System Access API (Chromium / Modern Desktop & Android Chrome / PWA)
  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const fileHandle = await win.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'ملف نسخة احتياطية JSON',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      await writableStream.write(blob);
      await writableStream.close();

      return {
        success: true,
        destination: fileHandle.name || fileName,
        fileName,
      };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw new Error('تم إلغاء عملية الحفظ بواسطة المستخدم');
      }
      console.warn('showSaveFilePicker failed or was rejected, falling back to Blob download:', e);
    }
  }

  // 5. Standard Web / PWA Blob Download Fallback
  return new Promise<ExportResult>((resolve, reject) => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = 'noopener';

      document.body.appendChild(anchor);
      anchor.click();

      // Ensure click event finishes before cleaning up
      setTimeout(() => {
        try {
          document.body.removeChild(anchor);
          URL.revokeObjectURL(url);
        } catch (cleanupErr) {
          // ignore cleanup issues
        }
        resolve({
          success: true,
          destination: 'مجلد التنزيلات (Downloads)',
          fileName,
        });
      }, 300);
    } catch (err: any) {
      reject(new Error(err?.message || 'تعذر إنشاء وتنزيل ملف النسخة الاحتياطية'));
    }
  });
}
