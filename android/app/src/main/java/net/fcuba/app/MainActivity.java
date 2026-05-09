package net.fcuba.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends BridgeActivity {

    /**
     * Capacitor's Preferences plugin writes to this SharedPreferences file.
     * We read it directly so cross-origin pages (fcuba.net) can fetch values
     * via the FcubaNative bridge — Capacitor.Plugins.Preferences itself is
     * not exposed outside the configured hostname.
     */
    private static final String CAP_PREFS = "CapacitorStorage";

    private SwipeRefreshLayout swipeRefresh;
    private String bridgeScript = "";

    /**
     * URL extracted from an FCM notification tap that we couldn't navigate to
     * yet (because the WebView hadn't loaded its first page). Consumed once
     * by installPageLoadedListener.
     */
    private String pendingNotificationUrl;
    private boolean firstPageLoaded;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        View root = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars()
                | WindowInsetsCompat.Type.navigationBars()
                | WindowInsetsCompat.Type.displayCutout()
            );
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        wrapWebViewWithSwipeRefresh();
        getBridge().getWebView().addJavascriptInterface(new FcubaNative(), "FcubaNative");
        bridgeScript = loadAssetText("public/app-bridge.js");
        installPageLoadedListener();

        pendingNotificationUrl = extractNotificationUrl(getIntent());
    }

    /**
     * Tap on an FCM notification while the app is alive (foreground or
     * background). Android delivers the notification's data payload as
     * Bundle extras here; we re-route the WebView to the deep-link URL.
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String url = extractNotificationUrl(intent);
        if (url == null) return;

        WebView wv = getBridge().getWebView();
        if (wv != null && firstPageLoaded) {
            wv.loadUrl(url);
        } else {
            pendingNotificationUrl = url;
        }
    }

    /**
     * FCM puts the data payload (including our 'url' key from FcmSender) on
     * the launcher intent's extras when the user taps a notification.
     * Restricted to fcuba.net to avoid honoring spoofed deep links.
     */
    private String extractNotificationUrl(Intent intent) {
        if (intent == null) return null;
        Bundle extras = intent.getExtras();
        if (extras == null) return null;
        String url = extras.getString("url");
        if (url == null || url.isEmpty()) return null;
        if (!url.startsWith("https://fcuba.net") && !url.startsWith("http://fcuba.net")) return null;
        return url;
    }

    private void wrapWebViewWithSwipeRefresh() {
        WebView webView = getBridge().getWebView();
        ViewGroup parent = (ViewGroup) webView.getParent();
        if (parent == null) return;

        ViewGroup.LayoutParams originalParams = webView.getLayoutParams();
        int index = parent.indexOfChild(webView);
        parent.removeView(webView);

        swipeRefresh = new SwipeRefreshLayout(this);
        swipeRefresh.setLayoutParams(originalParams);
        swipeRefresh.addView(
            webView,
            new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        );
        parent.addView(swipeRefresh, index);

        swipeRefresh.setProgressBackgroundColorSchemeColor(0xFF1A1F2E);
        swipeRefresh.setColorSchemeColors(0xFFFF4757, 0xFF6EA8FE);

        swipeRefresh.setOnRefreshListener(() -> {
            swipeRefresh.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
            webView.reload();
        });

        webView.setOnScrollChangeListener((v, sx, sy, osx, osy) -> {
            swipeRefresh.setEnabled(sy == 0);
        });
    }

    private void installPageLoadedListener() {
        getBridge().addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView wv) {
                if (swipeRefresh != null && swipeRefresh.isRefreshing()) {
                    swipeRefresh.setRefreshing(false);
                    swipeRefresh.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                }

                // First page after a cold-start triggered by a notification
                // tap: replace the boot index.html load with the deep-link
                // URL so the user lands directly on the conversation/post.
                if (!firstPageLoaded && pendingNotificationUrl != null) {
                    String target = pendingNotificationUrl;
                    pendingNotificationUrl = null;
                    firstPageLoaded = true;
                    wv.loadUrl(target);
                    return;
                }
                firstPageLoaded = true;

                if (!bridgeScript.isEmpty()) {
                    wv.evaluateJavascript(bridgeScript, null);
                }
            }
        });
    }

    private String loadAssetText(String path) {
        try (InputStream is = getAssets().open(path)) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[1024];
            int n;
            while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
            return baos.toString("UTF-8");
        } catch (IOException e) {
            return "";
        }
    }

    /**
     * Cross-origin bridge exposed as window.FcubaNative on every WebView page.
     * Plugins under Capacitor.Plugins.* are not reachable from fcuba.net (only
     * from the configured hostname), so this is how the forum side talks to
     * native features.
     */
    private class FcubaNative {

        @JavascriptInterface
        public void impact(String intensity) {
            long duration;
            int amplitude;
            String i = intensity == null ? "Light" : intensity;
            switch (i) {
                case "Heavy":
                    duration = 30; amplitude = 255; break;
                case "Medium":
                    duration = 20; amplitude = 200; break;
                case "Light":
                default:
                    duration = 10; amplitude = 110; break;
            }
            Vibrator v = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vm != null) v = vm.getDefaultVibrator();
            } else {
                v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            }
            if (v == null || !v.hasVibrator()) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(duration, amplitude));
            } else {
                v.vibrate(duration);
            }
        }

        /**
         * Read the FCM token saved by push.js into Capacitor Preferences.
         * Returns "" if not yet captured. Used by app-bridge.js to decide
         * whether to render the floating token-copy FAB on fcuba.net.
         */
        @JavascriptInterface
        public String getFcmToken() {
            SharedPreferences prefs = getSharedPreferences(CAP_PREFS, Context.MODE_PRIVATE);
            String t = prefs.getString("fcm_token", "");
            return t == null ? "" : t;
        }

        /**
         * Consume the URL extracted from an FCM notification tap that
         * cold-started the app. boot.js calls this before its onboarding
         * routing so the user lands directly on the deep link instead of
         * flashing through the forum root.
         */
        @JavascriptInterface
        public String getPendingNotificationUrl() {
            String url = pendingNotificationUrl;
            pendingNotificationUrl = null;
            return url == null ? "" : url;
        }
    }
}
