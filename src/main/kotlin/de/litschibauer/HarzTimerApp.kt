import javafx.application.Application
import javafx.scene.Scene
import javafx.scene.web.WebView
import javafx.stage.Stage

class HarzTimerApp : Application() {
    override fun start(primaryStage: Stage) {
        // Erstelle ein WebView-Objekt, um die HTML-Seite anzuzeigen
        val webView = WebView()
        // Lade die HTML-Datei
        webView.engine.load("file:///${System.getProperty("user.dir")}/resources/index.html")

        // Erstelle die Szene und stelle sie auf die Bühne (Stage)
        val scene = Scene(webView, 800.0, 600.0)
        primaryStage.scene = scene
        primaryStage.title = "Harz-Timer"
        primaryStage.show()
    }
}

fun main() {
    Application.launch(HarzTimerApp::class.java)
}
