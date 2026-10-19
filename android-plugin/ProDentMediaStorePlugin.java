package com.prodent.app.plugins;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Android Native Plugin for Capacitor
 * Saves ProDent JSON backups directly to:
 * Downloads/ProDent/<filename>
 * using Android MediaStore API (Scoped Storage compliant for Android 10+).
 */
@CapacitorPlugin(name = "ProDentMediaStore")
public class ProDentMediaStorePlugin extends Plugin {

    @PluginMethod
    public void saveBackup(PluginCall call) {
        String fileName = call.getString("fileName");
        String content = call.getString("content");

        if (fileName == null || content == null) {
            call.reject("FileName and content are required");
            return;
        }

        try {
            Context context = getContext();
            boolean success = false;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ProDent");

                Uri uri = context.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    try (OutputStream outputStream = context.getContentResolver().openOutputStream(uri)) {
                        if (outputStream != null) {
                            outputStream.write(content.getBytes(StandardCharsets.UTF_8));
                            outputStream.flush();
                            success = true;
                        }
                    }
                }
            } else {
                File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "ProDent");
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                File file = new File(dir, fileName);
                try (FileOutputStream fos = new FileOutputStream(file)) {
                    fos.write(content.getBytes(StandardCharsets.UTF_8));
                    fos.flush();
                    success = true;
                }
            }

            if (success) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("path", "Downloads/ProDent/" + fileName);
                call.resolve(ret);
            } else {
                call.reject("Could not write file to Downloads/ProDent");
            }
        } catch (Exception e) {
            call.reject("Error saving file: " + e.getMessage(), e);
        }
    }
}
