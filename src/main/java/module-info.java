module de.litschibauer.harztimerapp {
    requires javafx.controls;
    requires javafx.fxml;
    requires kotlin.stdlib;


    opens de.litschibauer.harztimerapp to javafx.fxml;
    exports de.litschibauer.harztimerapp;
}