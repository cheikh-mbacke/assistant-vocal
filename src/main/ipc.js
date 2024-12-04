const { ipcMain } = require("electron/main");
const { exec } = require("child_process");
const path = require("node:path");
const os = require("os");
const fs = require("fs");
const fsPromises = require("fs").promises;

function getWhisperPath() {
  const platform = process.platform;
  const basePath = path.join(__dirname, "../../whisper.cpp/build");

  switch (platform) {
    case "win32":
      return path.join(basePath, "windows/bin/Release/main.exe");
    case "darwin":
      return path.join(basePath, "macos/main");
    case "linux":
      return path.join(basePath, "linux/main");
    default:
      throw new Error(`Plateforme non supportée: ${platform}`);
  }
}

function setupIPC() {
  // Gestionnaire pour l'écriture du fichier temporaire
  ipcMain.handle("write-temp-file", async (event, data) => {
    const tempPath = path.join(os.tmpdir(), `recording-${Date.now()}.wav`);
    let fileHandle = null;

    try {
      // Créer un nouveau fichier avec un timestamp unique
      fileHandle = await fsPromises.open(tempPath, "w");
      await fileHandle.writeFile(Buffer.from(data));

      // Vérification
      const stats = await fsPromises.stat(tempPath);
      console.log("Fichier écrit:", tempPath);
      console.log("Taille du fichier:", stats.size);

      return tempPath;
    } catch (error) {
      console.error("Erreur d'écriture du fichier:", error);
      throw error;
    } finally {
      // S'assurer que le fichier est bien fermé
      if (fileHandle) {
        await fileHandle.close();
      }
    }
  });

  // Gestionnaire pour l'audio
  ipcMain.handle("process-audio", async (event, audioPath) => {
    return new Promise((resolve, reject) => {
      const whisperPath = getWhisperPath();
      const modelPath = path.join(
        __dirname,
        "../../whisper.cpp/models/ggml-large-v3-turbo-q5_0.bin"
      );

      // Vérifications
      if (!fs.existsSync(whisperPath)) {
        reject(new Error(`Exécutable Whisper non trouvé: ${whisperPath}`));
        return;
      }

      if (!fs.existsSync(audioPath)) {
        reject(new Error(`Fichier audio non trouvé: ${audioPath}`));
        return;
      }

      // Lecture du début du fichier pour vérifier l'en-tête WAV
      const buffer = Buffer.alloc(44); // En-tête WAV standard
      try {
        fs.readSync(fs.openSync(audioPath, "r"), buffer, 0, 44, 0);
        console.log("En-tête du fichier:", buffer.toString("hex"));

        // Vérifier que c'est bien un fichier WAV
        const riffHeader = buffer.toString("utf8", 0, 4);
        const waveHeader = buffer.toString("utf8", 8, 12);

        if (riffHeader !== "RIFF" || waveHeader !== "WAVE") {
          console.error("Format de fichier invalide:", riffHeader, waveHeader);
          reject(new Error("Le fichier n'est pas un WAV valide"));
          return;
        }

        console.log("En-tête WAV valide détecté");
      } catch (error) {
        console.error("Erreur de lecture de l'en-tête:", error);
      }

      const command = `"${whisperPath}" -m "${modelPath}" -f "${audioPath}"`;
      console.log("Commande exécutée:", command);

      exec(command, (error, stdout, stderr) => {
        console.log("Sortie standard:", stdout);
        console.log("Sortie d'erreur:", stderr);

        if (error) {
          console.error("Erreur whisper:", error);
          reject(error);
          return;
        }

        // Nettoyer la sortie pour ne garder que le texte
        const cleanedOutput = stdout
          .split("\n")
          .map((line) => line.replace(/\[.*?\]/, "").trim()) // Enlève les timestamps [00:00:00.000 --> 00:00:00.000]
          .filter((line) => line !== "") // Enlève les lignes vides
          .join(" "); // Regroupe les lignes en un seul texte

        resolve(cleanedOutput || "Aucune transcription générée");
      });

    });
  });

  // Gestionnaire pour la suppression du fichier temporaire
  ipcMain.handle("delete-temp-file", async (event, filePath) => {
    if (fs.existsSync(filePath)) {
      try {
        await fsPromises.unlink(filePath);
        return true;
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        throw error;
      }
    }
    return true;
  });
}

module.exports = { setupIPC };
